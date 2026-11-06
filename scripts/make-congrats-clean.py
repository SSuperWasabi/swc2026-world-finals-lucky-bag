# 축하 화면 배경판 v3: 전환 18~53번 프레임의 가운데 흰 로고를 그림자로 바꾼다.
#  v1(2026-11-03): 순백 몸통만 칠함 → 등장 글로우는 남았지만 뾰족한 끝에 흰 점이 남음.
#  v2(2026-11-05): 밝은 곳을 끝까지 칠함 → 흰 점은 없어졌지만 등장 글로우(흰 빛 효과)까지 사라짐.
#  v3(2026-11-06): v2로 칠한 뒤, 넓게 퍼진 빛만 되살리고(4) 몸통 경계를 부드럽게(5) 한다. 흰 점은 v2처럼 없고 글로우는 v1처럼 남는다.
# v1과 같은 것: 로고 가운데의 순백 픽셀에서 시작, 띠 색 b0(로고 둘레 고리 중앙값), 그림자 색 d = b0 x 0.694(APAC 실측 비율).
# 바뀐 것:
#  1) 순백에서 시작해 "띠보다 밝은 픽셀(G > 띠G+6)"을 따라 끝까지 넓힌다(가장자리·뾰족한 끝·등장 번짐 포함).
#     흰빛을 더한 보라로는 나올 수 없게 파랑이 강한 색(마름모 연보라·테두리, 보라 칸)은 벽으로 두어 넘어가지 않는다.
#  2) 그래도 떨어져 남은 작은 흰 조각(400px 미만, 로고 8px 안, 마름모 색에 닿지 않은 것)을 함께 칠한다.
#  3) 색 바꿈: 흰빛이 더해진 양 a=(G-띠G)/(255-띠G)만큼 흰색 대신 그림자 색으로 바꾼다. new = 원래 - a x (255 - d).
#     a가 0에 가까우면 거의 안 바뀌므로 칠한 영역 경계에 턱이 생기지 않는다.
#     a가 큰 로고 몸통(0.5 이상)은 v1처럼 띠 색~그림자 색으로 다시 칠해 그림자 진하기를 v1과 같게 한다(0.15~0.5는 섞음).
# 사용: py scripts/make-congrats-clean.py <WF 전환 원본 dir(0713_TRANS_FINAL)> <출력 dir(render/congrats-wf/clean)> [빛 살리기 반지름, 기본 2]
#  → 그다음 scripts/ae/wf-congrats.jsx로 축하 A·B를 렌더하고 1024x1366으로 인코딩한다(handoff 13절).
import sys, os
sys.stdout.reconfigure(encoding='utf-8')
import numpy as np
from PIL import Image

from collections import deque

# 연결 요소(8방향) 라벨링: scipy 없이 쓰는 간단한 BFS. 반환: (라벨 배열, 덩어리 크기 목록)
def label(mask):
    h, w = mask.shape
    lab = np.zeros((h, w), np.int32)
    sizes = [0]
    ys, xs = np.nonzero(mask)
    m = mask
    cur = 0
    for y0, x0 in zip(ys.tolist(), xs.tolist()):
        if lab[y0, x0]:
            continue
        cur += 1; lab[y0, x0] = cur; q = deque([(y0, x0)]); s = 0
        while q:
            y, x = q.popleft(); s += 1
            for dy in (-1, 0, 1):
                yy = y + dy
                if yy < 0 or yy >= h: continue
                for dx in (-1, 0, 1):
                    xx = x + dx
                    if 0 <= xx < w and m[yy, xx] and not lab[yy, xx]:
                        lab[yy, xx] = cur; q.append((yy, xx))
        sizes.append(s)
    return lab, sizes


wf_src, out = sys.argv[1:3]
RO = int(sys.argv[3]) if len(sys.argv) > 3 else 2  # 빛 살리기: 이 반지름 원보다 가는 밝은 부분은 점으로 보고 지운다
K = 0.694  # APAC 띠 대비 그림자 비율(v1에서 실측)
CX, CY, R = 960, 540, 300
Y0, Y1, X0, X1 = CY - R, CY + R, CX - R, CX + R
yy, xx = np.mgrid[Y0:Y1, X0:X1]
near = ((xx - CX) ** 2 + (yy - CY) ** 2) < R * R
core = ((xx - CX) ** 2 + (yy - CY) ** 2) < 100 * 100

def shift(m, dy, dx):
    o = np.zeros_like(m)
    h, w = m.shape
    o[max(dy, 0):h + min(dy, 0), max(dx, 0):w + min(dx, 0)] = m[max(-dy, 0):h + min(-dy, 0), max(-dx, 0):w + min(-dx, 0)]
    return o

def nb8(m):
    o = m.copy()
    for dy in (-1, 0, 1):
        for dx in (-1, 0, 1):
            if dy or dx:
                o |= shift(m, dy, dx)
    return o

def dilate(m, r):
    o = m.copy()
    for dy in range(-r, r + 1):
        for dx in range(-r, r + 1):
            if dx * dx + dy * dy <= r * r:
                o |= shift(m, dy, dx)
    return o

def gshift(v, dy, dx, fill):
    o = np.full_like(v, fill)
    h, w = v.shape
    o[max(dy, 0):h + min(dy, 0), max(dx, 0):w + min(dx, 0)] = v[max(-dy, 0):h + min(-dy, 0), max(-dx, 0):w + min(-dx, 0)]
    return o

def gopen(v, r):
    # 회색조 열기(깎았다가 다시 불리기): 반지름 r 원이 들어가지 않는 가는 밝은 부분만 사라지고, 넓은 빛은 그대로 남는다.
    offs = [(dy, dx) for dy in range(-r, r + 1) for dx in range(-r, r + 1) if dx * dx + dy * dy <= r * r]
    e = np.minimum.reduce([gshift(v, dy, dx, 0.0) for dy, dx in offs])
    return np.maximum.reduce([gshift(e, dy, dx, 0.0) for dy, dx in offs])

def grow(seed, allow):
    s = seed & allow
    while True:
        g = s | (allow & nb8(s))
        if g.sum() == s.sum():
            return g
        s = g

os.makedirs(out, exist_ok=True)
for n in range(18, 54):
    im = np.asarray(Image.open(os.path.join(wf_src, '0713_TRANS_FINALE_%05d.png' % n)).convert('RGBA')).astype(np.float64)
    full = im.copy()
    rgb = im[Y0:Y1, X0:X1, :3]
    mn = rgb.min(2); sat = rgb.max(2) - mn
    G, B = rgb[..., 1], rgb[..., 2]
    white = (mn > 235) & (sat < 15) & near
    S = grow(white & core, white)                       # v1과 같은 순백 씨앗
    ring = dilate(S, 14) & ~dilate(S, 6) & near & (rgb.max(2) < 140)
    b0 = np.median(rgb[ring], axis=0) if ring.any() else np.array([46.0, 0.0, 105.0])
    d = b0 * K
    # 벽: 보라 바탕에 흰빛을 더해서는 나올 수 없을 만큼 파랑이 강한 색(마름모 연보라·테두리, 보라 칸).
    # 흰빛 a가 더해진 보라는 G=255a, B=바탕B+(255-바탕B)a이므로 바탕 B를 넉넉히 160으로 잡으면 G >= 255(B-160)/95 - 여유(로고 둘레 바탕은 B 105~150).
    wall = G < 255.0 * (B - 160.0) / 95.0 - 15
    lit = (G > b0[1] + 6) & ~wall & near                # 띠보다 밝은 곳
    M = grow(S, lit)                                    # 1) 끝까지 넓히기
    # 2) 떨어진 작은 흰 조각
    bright = (mn > 150) & (sat < 60) & near & ~M & ~wall
    lab, sz = label(bright)
    zone = dilate(M, 8)
    extra = np.zeros_like(M)
    for i in range(1, len(sz)):
        if sz[i] < 400:
            part = lab == i
            # 로고에서 8px 안이고, 마름모 색(벽)에 닿지 않은 조각만(마름모 안의 아주 밝은 픽셀은 제외)
            if (part & zone).any() and not (nb8(part) & wall).any():
                extra |= part
    M2 = M | (grow(extra, lit) if extra.any() else extra)
    M2 = M2 | (dilate(M2, 1) & lit)
    # 3) 흰빛 양만큼 그림자 색으로
    a = np.clip((G - b0[1]) / (255.0 - b0[1]), 0, 1)[..., None]
    sub = rgb - a * (255.0 - d)                         # 번짐: 흰빛만 빼고 그림자 색을 더함(바탕 색 유지)
    rep = b0 * (1 - a) + d * a                          # 몸통: v1처럼 띠 색과 그림자 색으로 다시 칠함
    w = np.clip((a - 0.15) / 0.35, 0, 1)                # a 0.15 이하는 번짐 방식, 0.5 이상은 몸통 방식, 그 사이는 섞음
    new = np.where(M2[..., None], w * rep + (1 - w) * sub, rgb)
    # 4) 빛 살리기(v3): 몸통(순백+1px) 밖에서 지운 흰빛 중 넓게 퍼진 빛(등장 글로우)은 원래대로 되돌리고, 가는 끝의 흰 점만 지운 채로 둔다.
    body = dilate(S, 1)
    ao = np.where(M2 & ~body, a[..., 0], 0.0)
    g = gopen(ao, RO)
    keep = np.where(ao > 1e-3, np.clip(g / np.maximum(ao, 1e-3), 0, 1), 0.0)[..., None]
    new = new + keep * (rgb - new)
    # 5) 살린 빛과 맞닿은 몸통 경계만 계단 없이 부드럽게(1-2-1 흐림). 빛이 없는 프레임(27번 이후)은 경계가 그대로다.
    edge = dilate(S, 1) & dilate(~S, 1) & dilate(keep[..., 0] > 0.3, 2)
    k1 = [(-1, 1.0), (0, 2.0), (1, 1.0)]
    sm = np.zeros_like(new)
    for dy, wy in k1:
        for dx, wx in k1:
            sm += wy * wx * np.roll(np.roll(new, dy, 0), dx, 1)
    new = np.where(edge[..., None], sm / 16.0, new)
    full[Y0:Y1, X0:X1, :3] = new
    Image.fromarray(full.round().clip(0, 255).astype(np.uint8), 'RGBA').save(os.path.join(out, 'TRANS_CLEAN_%05d.png' % n))
    print('WF', n, '씨앗', int(S.sum()), '칠한 영역', int(M2.sum()), '떨어진 조각', int(extra.sum()), '살린 빛', round(float((keep[...,0]*ao).sum()),1), '띠', b0.round(), '그림자', d.round())
print('완료', out)
