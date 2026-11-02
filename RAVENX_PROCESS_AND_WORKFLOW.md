# ==============================================================================
#                      RAVEN-X TACTICAL SYSTEM
#             MULTI-DOMAIN INTELLIGENCE & OSINT COMMAND HUB
#                  PROJECT PROCESS & WORKFLOW SPECIFICATION
# ==============================================================================
# Security Clearance : TOP SECRET // SCI
# Version            : 8.2.0 (Tactical Hardened Edition)
# Author             : Quaiz / RavenX Core Engineering Team
# Document Status    : OFFICIAL ARCHITECTURAL & OPERATIONAL MANUAL
# ==============================================================================

---

## MỤC LỤC
1. TỔNG QUAN DỰ ÁN (PROJECT OVERVIEW)
2. STACK CÔNG NGHỆ & CẤU TRÚC THƯ MỤC (TECH STACK & REPOSITORY STRUCTURE)
3. LUỒNG DỮ LIỆU TỔNG THỂ (END-TO-END DATA PIPELINE & WORKFLOW)
4. CƠ CHẾ BẢO VỆ & CÁCH LY SỰ CỐ (FAULT ISOLATION & DEFENSIVE ARCHITECTURE)
5. HỆ THỐNG PHÂN HỆ TÌNH BÁO (34 CLASSIFIED OSINT MODULES BREAKDOWN)
6. TÁC TỬ PHÂN TÍCH TÌNH BÁO AI (AI AGENTIC SITREP WORKFLOW)
7. QUY TRÌNH PHÁT TRIỂN & DEVOPS DEPLOYMENT (CI/CD & ZERO-DOWNTIME DEPLOYMENT)
8. QUY TRÌNH VẬN HÀNH CHUẨN CỦA OPERATOR (STANDARD OPERATING PROCEDURE - SOP)

---

## 1. TỔNG QUAN DỰ ÁN (PROJECT OVERVIEW)

### 1.1 RavenX là gì?
RAVEN-X là một Trạm Tình báo Đa miền (Multi-Domain Intelligence Hub) và Trung tâm Chỉ huy & Điều khiển Tác chiến (C2 / ISR Command & Control Center). Hệ thống không hoạt động như một website thông thường mà mô phỏng một **Hệ điều hành Cửa sổ Chiến thuật (Windowing Tactical OS)**, mang phong cách Cyberpunk / Military HUD.

### 1.2 Mục tiêu Cốt lõi
- **Thu thập Đa nguồn (Multi-Source Ingestion):** Tự động hóa quá trình kéo dữ liệu liên tục từ các luồng tín hiệu (SIGINT), viễn thám vệ tinh (GEOINT) và nguồn tin mở (OSINT) trên phạm vi toàn cầu.
- **Tổng hợp & Nhận thức Tình huống (Situational Awareness):** Trực quan hóa cùng lúc hàng nghìn thực thể (máy bay, tàu biển, vệ tinh, đám cháy, động đất, trạm vô tuyến, cáp quang biển) trên nền tảng bản đồ số Leaflet.
- **Phân tích Đe dọa Đột phá bằng AI:** Sử dụng mô hình ngôn ngữ lớn (LLM như Gemini / Groq) để phân tích chéo các nguồn tin thô và xuất Báo cáo Tình hình Tác chiến (SITREP) theo thời gian thực.
- **Tính Sẵn sàng Cao (High Resilience):** Hệ thống có khả năng tự phục hồi, cách ly lỗi độc lập theo từng cửa sổ và chạy liên tục 24/7 với 60 FPS.

---

## 2. STACK CÔNG NGHỆ & CẤU TRÚC THƯ MỤC

### 2.1 Technology Stack
- **Frontend Core:** React 18, Vite 5, TailwindCSS (tuỳ biến bảng màu quân sự Dark / Tactical Amber / NVG Green / BHO), Lucide Icons.
- **State Management:** Zustand (với middleware lưu trữ persistence `localStorage`).
- **Geospatial & Mapping:** Leaflet, React-Leaflet, MGRS (Military Grid Reference System), Satellite.js (tính toán quỹ đạo vệ tinh SGP4/SDP4), RainViewer Radar API.
- **Audio Engine:** Web Audio API & Synth FX (âm thanh tương tác tác chiến phong cách COD / Cyberpunk HUD).
- **Backend Core:** Python 3.10+, Flask, Gunicorn (Multi-threaded & Thread-pooling).
- **Database:** SQLite cục bộ (`ravenx.db`) kết nối Turso LibSQL Cloud (WAL Mode).
- **AI Engine:** Groq API / Google Gemini 2.5 Flash / Ollama Fallback.
- **DevOps & Infrastructure:** Docker & Docker Compose, Nginx Reverse Proxy, Let's Encrypt (Certbot SSL), DuckDNS Dynamic DNS, VPS Oracle Cloud Linux (Ubuntu 22.04 LTS).

### 2.2 Cấu trúc Thư mục Dự án
```
RavenX/
├── backend/                        # Lõi xử lý dữ liệu trung gian & Proxy API
│   ├── server.py                   # Flask App chính: REST API, Proxy feeds, Database query
│   ├── ravenx.db                   # Cơ sở dữ liệu SQLite lưu trữ dữ liệu căn cứ, hầm ngầm, safehouse
│   ├── Dockerfile                  # Container đóng gói Backend Gunicorn
│   └── requirements.txt            # Thư viện phụ thuộc Python
│
├── tactical-ui/                    # Giao diện Tác chiến Frontend (React + Vite)
│   ├── src/
│   │   ├── components/             # 34 Modules tác chiến độc lập
│   │   │   ├── GothamGlobe.jsx     # Lõi bản đồ Leaflet trung tâm
│   │   │   ├── OverlayLayers.jsx   # 28+ Lớp phủ viễn trắc (vệ tinh, tàu bè, đám cháy, v.v.)
│   │   │   ├── TacticalMapTools.jsx# Công cụ thước ngắm Rangefinder & vành đai Geofence
│   │   │   ├── AIAnalyst.jsx       # Trạm tình báo AI tổng hợp SITREP
│   │   │   ├── ErrorBoundary.jsx   # WindowErrorBoundary cách ly lỗi từng cửa sổ
│   │   │   └── ...                 # Các module chuyên dụng (FlightTracking, Vessels, News, v.v.)
│   │   ├── Layout.jsx              # Hệ thống quản lý cửa sổ (Window Manager: drag, resize, z-index)
│   │   ├── store.js                # Zustand Global Store quản lý toàn bộ Telemetry & UI State
│   │   ├── auth.js                 # Quản lý phiên đăng nhập Operator & Clearance cấp quyền
│   │   └── utils/audioEngine.js    # Bộ tổng hợp âm thanh chiến thuật Web Audio
│   ├── Dockerfile                  # Container đóng gói Frontend Nginx
│   └── package.json                # Dependencies Frontend
│
├── docker-compose.yml              # Cấu hình khởi chạy đồng bộ Frontend + Backend
├── nginx.conf                      # Cấu hình Nginx Web Server, Reverse Proxy & SSL Let's Encrypt
└── scratch/                        # Kịch bản kiểm thử, chẩn đoán và vá lỗi hệ thống
```

---

## 3. LUỒNG DỮ LIỆU TỔNG THỂ (END-TO-END DATA PIPELINE)

Hệ thống vận hành theo quy trình khép kín 5 giai đoạn:

```
[Global OSINT APIs] 
        │ (Raw Feeds: JSON, GeoJSON, TLE, CSV)
        ▼
[Backend Proxy & Thread Pool (Python/Flask)]
        │ (Cache, Normalize, Shield Rate Limits)
        ▼
[Nginx Reverse Proxy & SSL (VPS Oracle)]
        │ (HTTPS / WSS Encrypted Transmission)
        ▼
[Zustand Store (Defensive Parsing & Sanitization)]
        │ (Normalized State Dispatch)
        ├────────────────────────┬────────────────────────┐
        ▼                        ▼                        ▼
[Leaflet Map Engine]     [34 Window Modules]      [AI Intel Analyst]
(Canvas Render 60FPS)    (Isolated Boundaries)    (Context-Injected SITREP)
```

### Chi tiết các giai đoạn:

#### Giai đoạn 1: Thu thập Dữ liệu Toàn cầu (Global Ingestion)
- **NASA FIRMS:** Kéo dữ liệu bức xạ nhiệt độ cao để phát hiện siêu đám cháy hoặc pháo kích chiến trường.
- **USGS Earthquake:** Nhận diện các chấn động địa chấn từ cấp 2.5+ trong 24 giờ qua.
- **OpenSky Network & ADS-B:** Bắt sóng transponder máy bay thương mại, chuyên cơ VIP và các mã khẩn cấp (Squawk 7700 - Emergency, 7600 - Mất liên lạc, 7500 - Không tặc).
- **SatNOGS & Celestrak:** Cập nhật bộ tham số TLE (Two-Line Element) của các vệ tinh quân sự và trinh sát.
- **GDACS & GDETL:** Quét tin tức xung đột chính trị và thảm hoạ thiên nhiên (lũ lụt, hạn hán).
- **Interpol API:** Truy vấn danh sách truy nã đỏ (Red Notice) các phần tử khủng bố, tội phạm quốc tế.

#### Giai đoạn 2: Chuẩn hoá & Giảm tải tại Backend (Backend Proxy Hub)
- **Đa luồng & Thread-Pool:** Backend kích hoạt các luồng ngầm định kỳ kéo dữ liệu, không bắt frontend phải gọi trực tiếp đến các máy chủ bên thứ ba.
- **Shield Rate-Limit:** Các API có giới hạn ngặt nghèo (như `wheretheiss.at` với 1 req/s) được backend gom nhóm cache (LRU Memory Cache).
- **Lưu trữ Căn cứ Tối mật:** Toạ độ các hầm tên lửa, căn cứ ngầm, mạng lưới Safehouses của Operator được bảo vệ trong SQLite mã hoá, chỉ mở cho client đã xác thực.

#### Giai đoạn 3: Phân phối & Quản lý Trạng thái (Zustand Global Store)
- Toàn bộ dữ liệu sau khi tải về được phân phối vào [`tactical-ui/src/store.js`](file:///d:/ThirdYearsInHell/miniproject/RavenX/tactical-ui/src/store.js).
- Quản lý đồng bộ trạng thái: toạ độ mục tiêu đang khoá (`selectedTarget`), vị trí của Operator (`operatorCoords`), danh sách module đang mở/thu nhỏ, cấu hình bản đồ, và mức cảnh báo an ninh toàn cầu.

#### Giai đoạn 4: Hiển thị Đa nhiệm & Tác chiến (UI & Geospatial Rendering)
- Giao diện người dùng tổ chức thành các cửa sổ độc lập (Window OS).
- Bản đồ Leaflet dựng trên nền Canvas (`preferCanvas={true}`) để xử lý mượt mà hàng nghìn điểm nút cùng lúc mà không làm nghẽn CPU/GPU.

---

## 4. CƠ CHẾ BẢO VỆ & CÁCH LY SỰ CỐ (DEFENSIVE ARCHITECTURE)

Để đảm bảo hệ thống đạt chuẩn tác chiến 24/7 và loại bỏ nguy cơ sập toàn diện khi gặp dữ liệu xấu, RavenX thiết lập 3 tầng bảo vệ nghiêm ngặt:

### 4.1 Lớp Cách ly Sự cố Cửa sổ (`WindowErrorBoundary`)
- **Vấn đề trước đây:** Trong React, nếu một component con gặp lỗi JavaScript (ví dụ: API thời tiết trả về định dạng lạ), lỗi sẽ nổi lên root và làm sập toàn bộ ứng dụng thành màn hình đen (`FATAL SYSTEM CRASH`).
- **Giải pháp:** Mọi cửa sổ của 34 module trong [`Layout.jsx`](file:///d:/ThirdYearsInHell/miniproject/RavenX/tactical-ui/src/Layout.jsx) đều được bao bọc trong một component `<WindowErrorBoundary moduleId={id}>`.
- **Hiệu quả:** Nếu một module bị lỗi dữ liệu, chỉ riêng cửa sổ đó hiển thị thông báo `// TELEMETRY FAULT: [MODULE_NAME]` kèm nút `REINITIALIZE MODULE`. Bản đồ và 33 module còn lại vẫn chạy hoàn toàn bình thường.

### 4.2 Bộ lọc Toạ độ Tuyệt đối (Bulletproof Coordinate Sanitization)
- **Vấn đề trước đây:** Leaflet văng exception `Invalid LatLng object: (undefined, undefined)` khi vẽ Marker nếu toạ độ bị rỗng, null hoặc NaN.
- **Giải pháp:** Trong [`OverlayLayers.jsx`](file:///d:/ThirdYearsInHell/miniproject/RavenX/tactical-ui/src/components/OverlayLayers.jsx) và [`TacticalMapTools.jsx`](file:///d:/ThirdYearsInHell/miniproject/RavenX/tactical-ui/src/components/TacticalMapTools.jsx), tất cả các hàm render Marker/Polyline/Circle đều được đặt chốt kiểm tra:
  ```javascript
  !isNaN(Number(lat)) && !isNaN(Number(lon))
  ```
- **Fallback Geocoding:** Những bài báo OSINT không có toạ độ tự động được định vị ngẫu nhiên quanh toạ độ thủ đô của quốc gia liên quan thay vì văng lỗi toạ độ trống.

### 4.3 Phòng vệ Lưu trữ Cục bộ (`localStorage`)
- Mọi dữ liệu đọc ra từ `localStorage` khi người dùng F5 tải lại trang đều được parse phòng vệ bằng giá trị mặc định (Fallback defaults), loại bỏ tình trạng schema cũ gây crash ứng dụng.

---

## 5. HỆ THỐNG PHÂN HỆ TÌNH BÁO (34 CLASSIFIED OSINT MODULES)

| STT | Mã Module (ID) | Tên Phân Hệ | Chức năng Chiến thuật |
| :--- | :--- | :--- | :--- |
| 1 | `MAP_MODULE` | World Tactical Map | Lõi bản đồ số, kết nối vệ tinh và 28 lớp phủ viễn trắc |
| 2 | `AI_INTEL_ANALYST` | AI Tactical Analyst | Trợ lý phân tích tình báo chéo, xuất báo cáo SITREP |
| 3 | `OSINT_EVENTS` | Global OSINT Feed | Theo dõi dòng tin xung đột vũ trang và biến động địa chính trị |
| 4 | `MILITARY_BASES` | Military Registry | Hồ sơ các căn cứ quân sự, bãi phóng tên lửa hạt nhân |
| 5 | `ADSB_AIRCRAFT` | Global Flight Radar | Bắt sóng transponder máy bay toàn cầu, phát hiện squawk khẩn cấp |
| 6 | `LOCAL_AIR_RADAR` | Tactical Air Radar | Radar quét không phận tầm gần địa phương của Operator |
| 7 | `AIS_VESSELS` | Live Maritime Vessels | Giám sát vị trí tàu chiến quân sự và tàu hàng thương mại |
| 8 | `MARITIME_CHOKES` | Maritime Chokepoints | Theo dõi các điểm nghẽn hàng hải sống còn (Suez, Malacca, Hormuz) |
| 9 | `GLOBAL_PORTS` | Global Strategic Ports | Cơ sở dữ liệu và lưu lượng các cảng container quốc tế |
| 10 | `SHIPPING_LANES` | Commercial Sea Lanes | Các hải lộ vận tải biển huyết mạch |
| 11 | `SEISMIC` | Seismic Monitor | Giám sát động đất, phát hiện rung chấn thử nghiệm hạt nhân ngầm |
| 12 | `NASA_FIRES` | FIRMS Thermal Fires | Quét vệ tinh hồng ngoại điểm nóng bức xạ nhiệt và cháy chiến trường |
| 13 | `VOLCANOES` | Volcano Activity | Theo dõi các vụ phun trào núi lửa và tro bụi đe doạ đường bay |
| 14 | `DISPLACEMENT` | Displacement Events | Giám sát khủng hoảng tị nạn nhân đạo do chiến tranh |
| 15 | `FLOODS` | GDACS Flood Warning | Cảnh báo lũ lụt và ngập úng hạ tầng trên diện rộng |
| 16 | `AIR_QUALITY` | Air Quality & Hazmat | Đo nồng độ bụi mịn PM2.5, cảnh báo nguy cơ sinh hóa học |
| 17 | `SPACE_WEATHER` | NOAA Space Weather | Quan trắc bão mặt trời (Solar Flares) làm nhiễu sóng radio |
| 18 | `ISS_TRACKER` | ISS Orbit Tracker | Theo dõi toạ độ và quỹ đạo của Trạm Vũ trụ Quốc tế |
| 19 | `SATELLITES` | Recon Satellites | Bắt vết 100+ vệ tinh do thám và viễn thông chiến lược |
| 20 | `GPS_JAMMING` | GPS Jamming Radar | Dò tìm các vùng bị chế áp điện tử và gây nhiễu sóng vệ tinh |
| 21 | `POWER_GRIDS` | Power Grid Status | Theo dõi sự cố mất điện và sập lưới điện quốc gia |
| 22 | `INTERNET_OUTAGES` | Internet Disruption | Giám sát các đợt kiểm duyệt, đứt cáp quang và ngắt kết nối Internet |
| 23 | `UNDERSEA_CABLES` | Submarine Fiber Cables| Mạng lưới các tuyến cáp quang ngầm dưới đáy đại dương |
| 24 | `OIL_GAS_PIPELINES`| Energy Infrastructure | Sơ đồ các đường ống dẫn dầu thô và khí đốt đốt chiến lược |
| 25 | `NUCLEAR_FACILITIES`| Nuclear Facilities | Hồ sơ và trạng thái vận hành của các nhà máy điện hạt nhân |
| 26 | `US_BORDER` | CBP Border Wait Times | Thời gian thông quan và ùn tắc tại các cửa khẩu biên giới Mỹ |
| 27 | `HAM_REPEATERS` | HAM Emergency Radio | Trạm chuyển tiếp sóng radio nghiệp dư dùng khi mất mạng |
| 28 | `MESHTASTIC` | Meshtastic LoRa Nodes | Mạng truyền thông không dây off-grid mã hoá độc lập |
| 29 | `WEATHER_ALERTS` | Severe Storms (NWS) | Cảnh báo siêu bão, lốc xoáy và thời tiết khắc nghiệt |
| 30 | `WORLD_CLOCK` | Operational Clocks | Đồng hồ đồng bộ các múi giờ tác chiến quốc tế |
| 31 | `MARKET_TERMINAL` | Geopolitical Markets | Biến động giá Dầu, Vàng, Ngoại hối và Tiền mã hoá theo thời cuộc |
| 32 | `PREDICTION_MARKETS`| Prediction Markets | Trí tuệ đám đông đo lường xác suất các biến cố địa chính trị |
| 33 | `WANTED_CRIMINALS` | Interpol Red Notices | Truy xuất hồ sơ các đối tượng bị truy nã gắt gao nhất thế giới |
| 34 | `COUNTRY_INTEL` | Country Dossier | Hồ sơ lãnh đạo, thế lực quân sự và quan hệ đối ngoại từng nước |

---

## 6. TÁC TỬ PHÂN TÍCH TÌNH BÁO AI (AI AGENTIC SITREP WORKFLOW)

Phân hệ [`AIAnalyst.jsx`](file:///d:/ThirdYearsInHell/miniproject/RavenX/tactical-ui/src/components/AIAnalyst.jsx) vận hành theo mô hình **Tác tử Tự động (Agentic Workflow)**:

```
[Operator Prompt] 
       │
       ▼
[Context Injection Engine]
       ├─ Bơm toạ độ các đám cháy nhiệt lượng cực lớn (>500MW)
       ├─ Bơm các chuyến bay bật cảnh báo khẩn nguy (Squawk 7700)
       ├─ Bơm các vùng xảy ra địa chấn > 6.0 độ Richter
       ├─ Bơm tin tức chiến sự và xung đột từ GDELT
       ├─ Bơm chỉ số giá dầu mỏ Brent, Vàng, và USD/VND
       ▼
[Model API: Gemini 2.5 Flash / Groq LLM]
       │ (Phân tích chéo - Cross-referencing dữ liệu đa miền)
       ▼
[Báo cáo Chiến thuật SITREP Chuẩn Quân sự]
       ├─ EXECUTIVE ASSESSMENT (Đánh giá chung)
       ├─ CRITICAL ANOMALIES (Bất thường đe doạ an ninh)
       ├─ GEOPOLITICAL IMPACT (Tác động kinh tế & quân sự)
       └─ RECOMMENDED ACTIONS (Đề xuất tác chiến cho Operator)
```

---

## 7. QUY TRÌNH PHÁT TRIỂN & DEVOPS DEPLOYMENT

Quy trình phát triển và đưa bản cập nhật lên máy chủ thực tế (Production) được thiết kế tối ưu hoá **Zero-Downtime** (không ngắt quãng phiên hoạt động của người dùng):

```
[Máy Local]               [GitHub Repository]         [Oracle Cloud VPS]
npm run build                     │                            │
      │                           │                            │
dist.tar.gz ─────────────> git push origin main                │
                                  │                            │
                                  └──────── SSH Pull ─────────> git pull origin main
                                                               │
                                                 docker cp dist.tar.gz -> container
                                                               │
                                                 tar -xzf -> /usr/share/nginx/html/
                                                               │
                                                 nginx -s reload (Hoàn tất 3s)
```

### Các bước cụ thể:
1. **Biên dịch Frontend (Local Machine):**
   - Chạy `npm run build` trong `tactical-ui`. Vite đóng gói và nén code thành các file JS/CSS tối ưu.
   - Nén thư mục dist: `tar -czf dist.tar.gz -C dist .`
2. **Quản lý Phiên bản (Git):**
   - Commit các thay đổi và push lên nhánh `main` trên GitHub (`Quaiz/RavenX`).
3. **Triển khai Tự động lên VPS Oracle:**
   - Kích hoạt lệnh SSH tới máy chủ `ubuntu@168.138.47.138`:
   ```bash
   cd ~/RavenX && \
   git pull origin main && \
   docker cp tactical-ui/dist.tar.gz ravenx-frontend:/tmp/dist.tar.gz && \
   docker exec ravenx-frontend sh -c "rm -rf /usr/share/nginx/html/* && tar -xzf /tmp/dist.tar.gz -C /usr/share/nginx/html/ && rm /tmp/dist.tar.gz" && \
   docker exec ravenx-frontend nginx -s reload && \
   echo "DEPLOY_SUCCESS"
   ```
4. **Bảo mật & SSL:**
   - Nginx trong container `ravenx-frontend` phục vụ cổng 80 & 443.
   - Chứng chỉ SSL tự động gia hạn thông qua Let's Encrypt / Certbot, liên kết domain động DuckDNS:
     `https://ravenx-protocol.duckdns.org`

---

## 8. QUY TRÌNH VẬN HÀNH CHUẨN CỦA OPERATOR (SOP)

Dành cho Sĩ quan Tác chiến khi đăng nhập vào hệ thống RavenX:

1. **Khởi động Phiên làm việc (Session Initiation):**
   - Mở trình duyệt truy cập: `https://ravenx-protocol.duckdns.org`
   - Đăng nhập tài khoản với quyền hạn bảo mật (Clearance: `TOP SECRET`). Hệ thống kích hoạt chuỗi âm thanh tác chiến và load bố cục workspace mặc định.
2. **Đọc Bức tranh Toàn cảnh (Global Picture):**
   - Quan sát bản đồ trung tâm: Kiểm tra các chỉ số telemetry góc trên bên phải (`LAT`, `LNG`, `MGRS`, `ELEV`).
   - Mở thanh **OVERLAYS** trên bản đồ để kích hoạt các lớp thông tin mong muốn (ví dụ: `OSINT EVENTS` kết hợp `FIRMS FIRES` và `MILITARY BASES`).
3. **Khoá Mục tiêu & Đánh giá (Target Lock & Interception):**
   - Nhấp vào một đối tượng truy nã hoặc tàu thuyền khả nghi -> Bản đồ tự động bay tới toạ độ (`flyTo`) và kích hoạt vòng quét **HVT Lock Pulsar** màu đỏ rực.
   - Sử dụng công cụ **RANGEFINDER** để đo khoảng cách và hướng di chuyển (Bearing), hoặc vẽ **GEOFENCE** xung quanh mục tiêu để cảnh báo xâm nhập.
4. **Xuất Báo cáo Tác chiến (Strategic SITREP):**
   - Mở module **AI INTEL ANALYST**.
   - Bấm `GENERATE SITREP` để AI tự động tổng hợp toàn bộ viễn trắc hiện tại thành báo cáo hoàn chỉnh.

---
[TÀI LIỆU LƯU HÀNH NỘI BỘ - HỆ THỐNG RAVEN-X TACTICAL COMMAND]
