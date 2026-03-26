# 🌿 SUNAE FARM — FARMOB v1

> 비닐하우스 스마트팜 자동화 프로토타입  
> 라즈베리파이 4B + Arduino Uno · 터미널 기반 개발 · GitHub 배포

---

## ⚡ 빠른 시작 (처음 실행 시 이 순서 지키세요)

```bash
# 1. 저장소 클론
git clone https://github.com/[계정명]/SUNAE-FARM.git
cd SUNAE-FARM

# 2. 라즈베리파이 의존성 설치
pip3 install pyserial flask python-telegram-bot --break-system-packages

# 3. arduino-cli 설치 확인
arduino-cli version

# 4. Arduino 코드 업로드
arduino-cli compile --fqbn arduino:avr:uno arduino/
arduino-cli upload -p /dev/ttyUSB0 --fqbn arduino:avr:uno arduino/

# 5. 메인 자동화 실행
python3 raspberry/main.py
```

---

## 📁 디렉토리 구조

```
SUNAE-FARM/
├── arduino/
│   └── sunae_farm.ino        # Arduino 센서·액추에이터 제어 코드
├── raspberry/
│   ├── main.py               # 자동화 메인 로직 (조건 판단·명령)
│   ├── dashboard.py          # 웹 대시보드 서버
│   ├── telegram_bot.py       # 텔레그램 알림 봇
│   └── config.py             # 임계값 설정 (여기서만 수정)
├── docs/
│   └── SUNAE_FARM_설계문서.docx
├── README.md                 # ← 지금 이 파일
└── .gitignore
```

---

## 🧠 시스템 구조

```
[ 스마트폰 / 외부 PC ]
        ↓ SSH (ngrok 터널)
[ 라즈베리파이 4B ]  ← 두뇌
  ├─ 조건 판단 (Python)
  ├─ 웹 대시보드
  ├─ 텔레그램 봇
  └─ git pull → 코드 배포
        ↓ USB 시리얼
[ Arduino Uno ]  ← 근육
  ├─ 센서 읽기
  ├─ 릴레이 제어
  └─ 버튼 입력 (MANUAL 모드)
```

---

## 🔘 동작 모드 3가지

| 모드 | 전환 방법 | 설명 |
|------|-----------|------|
| **AUTO** | 토글 스위치 | 센서값 기반 자동 제어 |
| **REMOTE** | 웹 대시보드 | 원격 수동 명령 → AUTO 복귀 |
| **MANUAL** | 현장 물리 버튼 | 버튼 직접 제어 · 라즈베리파이 무시 |

---

## ⚙️ 자동화 조건 (config.py에서 수정)

```python
# 관수
SOIL_DRY_THRESHOLD   = 40    # 토양수분 40% 이하 → 펌프 ON
PUMP_DURATION_SEC    = 5     # 펌프 작동 시간 (초)
WATERING_INTERVAL    = 1800  # 관수 후 대기 (초, 30분)

# 환풍
FAN_TEMP_ON          = 28    # 온도 28°C 초과 → 팬 ON
FAN_TEMP_OFF         = 25    # 온도 25°C 이하 → 팬 OFF
FAN_HUM_ON           = 80    # 습도 80% 초과 → 팬 ON

# 측창
WINDOW_OPEN_TEMP     = 30    # 온도 30°C 초과 → 측창 열기
WINDOW_CLOSE_TEMP    = 25    # 온도 25°C 이하 → 측창 닫기

# 긴급 알림
ALERT_TEMP           = 35    # 온도 35°C 초과 → 텔레그램 긴급 알림
```

---

## 📌 핀맵 (Arduino Uno)

| 핀 | 연결 부품 | 비고 |
|----|-----------|------|
| A0 | 토양수분 센서 1 (민트) | |
| A1 | 토양수분 센서 2 (레몬밤) | |
| A2 | 토양수분 센서 3 (바질) | |
| D2 | DHT22 온습도 | **10kΩ 풀업저항 필수** |
| D3 | BH1750 SDA | I2C |
| D4 | BH1750 SCL | I2C |
| D5 | 릴레이 CH1 (펌프) | |
| D6 | 릴레이 CH2 (팬) | |
| D8~D11 | ULN2003 IN1~4 (스테퍼) | 측창 |
| D12 | 토글 스위치 | AUTO↔MANUAL |
| A3~A5 | 푸시버튼 × 3 | 수동 제어 |

---

## 🚨 절대 금지 (FARMOB 가드레일)

```
❌ delay()로 센서 블로킹          → millis() 기반으로만
❌ loop() 안에 while(true) 중첩
❌ 핀 번호 하드코딩               → #define 또는 const
❌ 릴레이 전압 미확인 배선
❌ 센서 이상치(0/-1/NaN) 처리 없이 진행
❌ 관수 중 측창 동시 작동         → 물 튀김 방지
❌ WiFi 끊겼을 때 로컬 fallback 없는 구조
❌ 저항식 토양수분 센서           → 반드시 캐패시티브
❌ DHT11 사용                     → 반드시 DHT22
```

---

## 🔧 원격 접속

```bash
# 같은 WiFi (집)
ssh pi@192.168.x.x

# 외부 어디서든 (ngrok)
# 라즈베리파이에서:
ngrok tcp 22
# 외부에서:
ssh pi@0.tcp.ngrok.io -p [포트번호]
```

---

## 🔄 코드 업데이트 배포

```bash
# 라즈베리파이에서
cd ~/SUNAE-FARM
git pull

# Arduino 코드도 바뀐 경우
arduino-cli upload -p /dev/ttyUSB0 --fqbn arduino:avr:uno arduino/

# 서비스 재시작
sudo systemctl restart sunae-farm
```

---

## 🐛 트러블슈팅

| 증상 | 원인 | 해결 |
|------|------|------|
| 토양수분 값이 0 또는 이상한 값 | 저항식 센서 사용 or 캘리브레이션 필요 | 캐패시티브 v1.2 확인, 공기·물 기준값 재설정 |
| DHT22 값이 -1 | 풀업저항 없음 | D2-VCC 사이 10kΩ 저항 연결 |
| Arduino 업로드 안 됨 | 포트 확인 필요 | `ls /dev/ttyUSB*` 또는 `ls /dev/ttyACM*` |
| WiFi 끊겨도 동작 유지 안 됨 | Fallback 코드 누락 | Arduino 독립 로직 확인 |
| 웹 대시보드 안 열림 | Flask 포트 충돌 | `sudo lsof -i :5000` 확인 |
| 텔레그램 알림 안 옴 | 봇 토큰 or CHAT_ID 오류 | config.py 확인 |

---

## 📋 체크리스트 (하우스 설치 전)

```
□ 집에서 센서 개별 테스트 완료
□ 릴레이 펌프·팬·스테퍼 동작 확인
□ AUTO / REMOTE / MANUAL 모드 전환 확인
□ WiFi 끊김 Fallback 테스트
□ 텔레그램 알림 수신 확인
□ 웹 대시보드 외부 접속 확인 (ngrok)
□ 방수 케이스 밀폐 확인
□ 케이블 타이 + 절연 테이프 처리
□ GitHub push → pull 배포 테스트
```

---

## 👥 팀

| 역할 | 담당 |
|------|------|
| 프로젝트 총괄 | 사령관 |
| 시스템 설계 | FARMOB 팀 (앤·플로우·와이어·스케치·릴레이·시리얼·대시·알람·로그) |

---

*SUNAE FARM · FARMOB v1 · 2026*
