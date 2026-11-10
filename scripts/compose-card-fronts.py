"""카드 앞면 루프 영상 만들기: 카드 앞면 PNG + 캐릭터 루핑 영상(검은 배경)을 방패 안에 합성.
- 검은 배경은 밝기로 투명 처리(캐릭터 어두운 부분은 살리도록 문턱을 낮게)
- 캐릭터 크기·위치·기울기는 Jason의 가시안(2026-11-10) 실측값을 따른다(PLACE).
  영상 속 기준점(두 눈의 가운데)을 카드 위 목표 지점에 맞추고, 배율·회전을 적용
- 캐릭터는 방패 프레임 '안쪽 창'으로만 보인다(프레임 아래 레이어처럼). 안쪽 창은 카드 그림에서 자동으로 딴다(inner_window)
- 출력: app/assets/lb/card-front-{a,b,c}-loop.mp4 (800×1206, H.264, 24fps, 10초 루프)
사용: py -I compose-card-fronts.py <ffmpeg> <pylib(numpy·PIL)> [abc]
"""
import sys, subprocess, math
from collections import deque
sys.path.insert(0, sys.argv[2])
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

FF = sys.argv[1]
ROOT = __file__.replace('\\', '/').rsplit('/scripts/', 1)[0]
LB = ROOT + '/app/assets/lb/'
W, H = 800, 1206
ONLY = sys.argv[3] if len(sys.argv) > 3 else 'abc'
PAIRS = [('a', 'card-front-a.png', 'card-front-a-ragdoll.mp4'),
         ('b', 'card-front-b.png', 'card-front-b-oracle.mp4'),
         ('c', 'card-front-c.png', 'card-front-c-yeonhong.mp4')]
# 가시안 실측 배치: s=배율(영상 960px 기준), rot=시계 방향 회전(도),
# src=영상 속 기준점(두 눈의 가운데), dst=그 점이 놓일 카드 좌표(800×1206)
PLACE = {
    'a': dict(s=0.985, rot=26.0, src=(186.5, 378.5), dst=(390.0, 507.0)),   # 랙돌: 가시안은 머리를 세운 자세(26° 회전)
    'b': dict(s=0.803, rot=0.0, src=(513.0, 349.0), dst=(463.6, 511.3)),    # 오라클
    'c': dict(s=0.769, rot=0.0, src=(505.5, 422.0), dst=(382.3, 558.4)),    # 연홍
}

def inner_window(card_rgb):
    """방패 프레임 안쪽 창 마스크: 방패 가운데에서 번져 나가다 색이 급하게 바뀌는 곳(프레임 안쪽 테두리)에서 멈춘다.
    구멍을 메운 뒤 2~3px 안쪽으로 줄여 프레임을 절대 덮지 않게 한다."""
    g = np.asarray(card_rgb.filter(ImageFilter.GaussianBlur(1.6)), np.float32) / 255
    gx = np.zeros((H, W), np.float32); gy = np.zeros((H, W), np.float32)
    gx[:, 1:-1] = np.abs(g[:, 2:] - g[:, :-2]).max(axis=2); gy[1:-1, :] = np.abs(g[2:, :] - g[:-2, :]).max(axis=2)
    wall = np.maximum(gx, gy) > 0.055
    lim = np.ones((H, W), bool); lim[150:900, 40:760] = False; wall |= lim
    seen = np.zeros((H, W), bool); q = deque([(520, 400)]); seen[520, 400] = True
    while q:
        y, x = q.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if not seen[ny, nx] and not wall[ny, nx]: seen[ny, nx] = True; q.append((ny, nx))
    m = Image.fromarray((seen * 255).astype(np.uint8))
    m = m.filter(ImageFilter.MaxFilter(15)).filter(ImageFilter.MinFilter(15))
    m = m.filter(ImageFilter.MinFilter(5)).filter(ImageFilter.GaussianBlur(1.2))
    area = int((np.asarray(m) > 128).sum())
    assert 250000 < area < 400000, f'방패 안쪽 창 면적이 이상함: {area}'   # 새어 나갔거나 막혔으면 멈춤
    return m

alpha_shape = Image.open(LB + 'card-front-a.png').convert('RGBA').getchannel('A').resize((W, H), Image.LANCZOS)

def frames(path):
    p = subprocess.Popen([FF, '-loglevel', 'error', '-i', path, '-map', '0:v:0', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
    while True:
        b = p.stdout.read(960 * 960 * 3)
        if len(b) < 960 * 960 * 3: break
        yield np.frombuffer(b, np.uint8).reshape(960, 960, 3)

def key(rgb):
    mx = rgb.max(axis=2).astype(np.float32)
    a = np.clip((mx - 6) / 22.0, 0, 1) ** 0.8
    return (a * 255).astype(np.uint8)

for tag, png, vid in PAIRS:
    if tag not in ONLY: continue
    card = Image.open(LB + png).convert('RGBA').resize((W, H), Image.LANCZOS)
    shield_mask = inner_window(card.convert('RGB'))   # 이 카드의 방패 안쪽 창
    card.putalpha(alpha_shape)  # 앞면 C는 투명 테두리가 없어서 A의 모양을 씀
    bgc = Image.new('RGBA', (W, H), (20, 6, 50, 255)); bgc.alpha_composite(card); card = bgc
    P = PLACE[tag]; s, rot = P['s'], P['rot']
    # 회전(영상 중심 기준, 잘리지 않게 캔버스 확장) 뒤 기준점이 옮겨가는 위치
    th = math.radians(rot); dx, dy = P['src'][0] - 480, P['src'][1] - 480
    rx, ry = dx * math.cos(th) - dy * math.sin(th), dx * math.sin(th) + dy * math.cos(th)
    probe = Image.new('L', (960, 960)).rotate(-rot, expand=True) if rot else Image.new('L', (960, 960))
    RW, RH = probe.size
    ax, ay = RW / 2 + rx, RH / 2 + ry                      # 회전된 그림 안의 기준점
    ox, oy = P['dst'][0] - ax * s, P['dst'][1] - ay * s    # 카드 위에 놓을 왼쪽 위 모서리
    size = (round(RW * s), round(RH * s))
    print(tag, 'scale', s, 'rot', rot, 'offset', (round(ox, 1), round(oy, 1)), 'size', size)
    out = LB + f'card-front-{tag}-loop.mp4'
    enc = subprocess.Popen([FF, '-loglevel', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', '24', '-i', '-',
                            '-an', '-c:v', 'libx264', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-crf', '17', '-preset', 'slow', '-g', '24',
                            '-movflags', '+faststart', out], stdin=subprocess.PIPE)
    poster = None
    for i, f in enumerate(frames(LB + vid)):
        ch = Image.fromarray(f).convert('RGBA'); ch.putalpha(Image.fromarray(key(f)))
        if rot: ch = ch.rotate(-rot, resample=Image.BICUBIC, expand=True)
        ch = ch.resize(size, Image.LANCZOS)
        # 카드 밖으로 나가는 부분은 잘라서 얹는다(음수 좌표 대응)
        px, py = round(ox), round(oy)
        cx0, cy0 = max(0, -px), max(0, -py); cx1, cy1 = min(ch.width, W - px), min(ch.height, H - py)
        layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        if cx1 > cx0 and cy1 > cy0: layer.alpha_composite(ch.crop((cx0, cy0, cx1, cy1)), (max(px, 0), max(py, 0)))
        a = np.asarray(layer.getchannel('A')).astype(np.uint16) * np.asarray(shield_mask).astype(np.uint16) // 255
        layer.putalpha(Image.fromarray(a.astype(np.uint8)))
        fr = card.copy(); fr.alpha_composite(layer)
        rgb = fr.convert('RGB')
        if i == 0: poster = rgb
        enc.stdin.write(rgb.tobytes())
    enc.stdin.close(); enc.wait()
    poster.save(LB + f'card-front-{tag}-poster.jpg', quality=90)
    print('저장', out)
