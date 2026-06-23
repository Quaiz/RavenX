<div align="center">
  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/CIA_Seal.svg/1200px-CIA_Seal.svg.png" width="100" />
  <h1>RAVEN-X TACTICAL SYSTEM</h1>
  <h3>MULTI-DOMAIN INTELLIGENCE & OSINT HUB</h3>
  
  [![Clearance](https://img.shields.io/badge/Clearance-TOP%20SECRET%20%2F%2F%20SCI-red.svg?style=for-the-badge)]()
  [![Status](https://img.shields.io/badge/Status-OPERATIONAL-success.svg?style=for-the-badge)]()
  [![Version](https://img.shields.io/badge/Version-v8.2.0-blue.svg?style=for-the-badge)]()
</div>

---

## 1. BÁO CÁO TÓM TẮT ĐIỀU HÀNH (EXECUTIVE SUMMARY)

> **THÔNG TIN MẬT (CLASSIFIED):** Việc sao chép hoặc phát tán tài liệu này mà không có sự ủy quyền sẽ bị truy tố ngay lập tức.

Dự án **RAVEN-X** được triển khai như một Trạm Tình báo Đa nhiệm khép kín. Không hoạt động dưới dạng một ứng dụng web thông thường, hệ thống mô phỏng một Trung tâm Chỉ huy Windowing OS.

**Mục tiêu cốt lõi:** Tự động hóa quá trình thu thập, tinh lọc và tổng hợp dữ liệu thời gian thực từ các luồng tín hiệu (SIGINT), hình ảnh vệ tinh (GEOINT) và nguồn tin mở (OSINT) trên toàn cầu nhằm cung cấp cảnh báo chiến lược sớm về khủng hoảng địa chính trị, xung đột vũ trang và thảm họa an ninh mạng.

---

## 2. NĂNG LỰC TÁC CHIẾN ĐIỆN TỬ & THUẬT TOÁN (CYBERNETIC CAPABILITIES)

Hệ thống được trang bị các lõi thuật toán tối tân để xử lý dữ liệu phi cấu trúc và ngăn chặn tình trạng quá tải thông tin:

| Hạng mục Phân tích | Tên mã Thuật toán | Cơ chế Hoạt động (Technical Implementation) |
| :--- | :--- | :--- |
| **AI Agentic Workflow** | `Tác tử Phân tích Phản xạ` | **Context Injection:** Tự động "bơm" bức tranh chiến sự hiện tại (tọa độ đám cháy, biểu tình, lưới điện) vào lõi xử lý LLM Gemini 2.5 Flash, ép AI phải phân tích chéo (Cross-reference) để xuất Báo cáo Đánh giá Đe dọa (SITREP). |
| **Data Science & Heuristic** | `Quét Bất thường Không gian` | **Outlier Filtration:** Thuật toán giám sát vệ tinh tự động đánh giá Năng lượng Bức xạ Nhiệt (FRP). Nếu nguồn nhiệt > 500 MW, hệ thống lập tức dán nhãn `MEGAFIRE` và tiêu hủy các tín hiệu nhiễu rác (< 20% Confidence). |
| **NLP & Text Mining** | `Phân tích Ngữ nghĩa OSINT` | **Keyword Interception:** Máy quét OSINT toàn cầu được trang bị màng lọc Regex cấp quân sự. Bắt được "ransomware" -> `Tấn công Mạng`. Bắt được "sabotage" -> `Phá hoại Vật lý`. |
| **High-Performance** | `Tối ưu Hóa Đa luồng` | **Thread-Pooling:** Backend Python (Flask) kích hoạt đa luồng để càn quét đồng thời 245 trạm khí tượng. Tích hợp LRU Cache và DOM Virtualization (Frontend) để duy trì 60 FPS trong môi trường dữ liệu khổng lồ. |

---

## 3. DANH MỤC VŨ KHÍ TÌNH BÁO (34 MODULES)

Hệ thống RAVEN-X được trang bị toàn diện **34 phân hệ và lớp quan trắc đa nhiệm**, bao phủ mọi mặt trận chiến lược:

### Xung đột & Tác chiến Quân sự
1. **OSINT EVENTS:** Cột mốc tình báo nguồn mở về các sự kiện địa chính trị và xung đột vũ trang toàn cầu.
2. **GPS INTERFERENCE:** Radar dò tìm các vùng bị chế áp điện tử và giả mạo GPS (Tác chiến Điện tử).
3. **MILITARY BASES:** Hồ sơ OSINT tuyệt mật lưu trữ tọa độ chính xác của các hầm ngầm, căn cứ chỉ huy, và silo vũ khí hạt nhân.
4. **DAY / NIGHT:** Ranh giới sáng/tối thời gian thực trên bản đồ, hỗ trợ lập kế hoạch tác chiến ban đêm.

### Môi trường & Thảm họa Thiên nhiên
5. **EARTHQUAKES:** Quan trắc chấn động địa chất toàn cầu (phát hiện động đất hoặc thử nghiệm hạt nhân ngầm).
6. **FIRMS ACTIVE FIRES:** Kênh cắm thẳng vào vệ tinh NASA FIRMS để truy quét điểm nóng bức xạ và siêu đám cháy.
7. **VOLCANOES:** Giám sát các núi lửa đang phun trào và rủi ro tro bụi.
8. **DISPLACEMENT EVENTS:** Theo dõi các cuộc khủng hoảng nhân đạo và làn sóng tị nạn diện rộng.

### Tình báo Hàng hải & Đại dương
9. **GLOBAL PORTS:** Cơ sở dữ liệu các cảng biển vận tải chiến lược toàn cầu.
10. **LIVE VESSELS:** Theo dõi AIS thời gian thực cho các tàu thương mại và tàu hải quân quân sự.
11. **MARITIME CHOKEPOINTS:** Giám sát các điểm nghẽn hàng hải huyết mạch (VD: Kênh đào Suez, Eo biển Hormuz).
12. **SHIPPING LANES:** Các tuyến đường vận tải biển và chuỗi cung ứng thương mại toàn cầu.

### Cơ sở Hạ tầng Chiến lược
13. **HAM REPEATERS:** Hạ tầng trạm phát sóng vô tuyến nghiệp dư dùng cho liên lạc khẩn cấp.
14. **INTERNET OUTAGES:** Giám sát trạng thái kiểm duyệt Internet, sập mạng lưới (Blackout) và sự cố định tuyến BGP toàn cầu.
15. **MESHTASTIC NODES:** Mạng lưới liên lạc lưới (Mesh) dùng sóng vô tuyến LoRa, bảo mật và không phụ thuộc Internet.
16. **NUCLEAR FACILITIES:** Hồ sơ các nhà máy điện hạt nhân và lò phản ứng trên thế giới.
17. **OIL & GAS PIPELINES:** Sơ đồ mạng lưới đường ống năng lượng dầu mỏ và khí đốt chiến lược.
18. **UNDERSEA CABLES:** Mạng lưới cáp quang biển toàn cầu (các mục tiêu dễ bị phá hoại).
19. **US BORDER WAIT TIMES:** Tình trạng ùn tắc và thời gian chờ tại các trạm kiểm soát Biên phòng Mỹ (CBP).

### Tình báo Hàng không & Không gian
20. **TACTICAL AIR RADAR:** Radar quét không phận tầm gần phục vụ nhận thức chiến thuật tại địa phương.
21. **ADSB AIRCRAFT:** Theo dõi chuyến bay toàn cầu, đánh chặn máy bay quân sự, VIP và các mã khẩn cấp (SQUAWK).
22. **ISS TRACKER:** Giám sát quỹ đạo Trạm Vũ trụ Quốc tế theo thời gian thực.
23. **SATELLITES:** Theo dõi quỹ đạo vệ tinh liên lạc và trinh sát chiến lược.

### Khí tượng & Thủy văn (Thời tiết)
24. **WEATHER RADAR:** Bản đồ radar thời tiết theo dõi lượng mưa và các đợt bão.
25. **DUST & HAZE:** Quan trắc bão bụi và chất lượng không khí (PM).
26. **FLOODS:** Cảnh báo lũ lụt và các vùng nguy hiểm theo thời gian thực.
27. **HEAT/COLD (NWS):** Cảnh báo nhiệt độ cực đoan (nắng nóng kỷ lục / bão tuyết).
28. **SEVERE STORMS:** Theo dõi các cơn bão lớn, lốc xoáy (Tornado) và siêu bão (Hurricane).

### Phân hệ Chỉ huy & Bảng Điều khiển (Dashboards)
29. **AI INTEL ANALYST:** Cố vấn Tác chiến AI (Gemini 2.5 Flash). Thu thập toàn bộ viễn trắc hệ thống để phân tích và xuất báo cáo đe dọa (SITREP) tức thời.
30. **WORLD CLOCK:** Đồng hồ chiến dịch, quản lý nhiều múi giờ cho các mặt trận tác chiến toàn cầu.
31. **WEATHER ALERTS & AQI:** Bảng điều khiển cảnh báo bão và nguy cơ sinh hóa (Hazmat/AQI) tại địa phương.
32. **MARKET TERMINAL:** Bảng điện tử đo nhịp tim nền kinh tế toàn cầu, theo dõi biến động Crypto, Forex, Hàng hóa.
33. **WANTED CRIMINALS (INTERPOL):** Kênh truy xuất trực tiếp Lệnh truy nã Đỏ của Interpol hiển thị tội phạm nguy hiểm.
34. **PREDICTION MARKETS:** Lầu năm góc ảo. Đo lường xác suất biến động địa chính trị thông qua Trí tuệ Đám đông.

*(Lưu ý: Hệ thống còn tích hợp sẵn các công cụ bản đồ chiến thuật cốt lõi trực tiếp trên màn hình như Tactical Geofence (Vẽ vùng an ninh), Rangefinder (Thước ngắm), và Time Machine Slider (Cỗ máy thời gian) để hỗ trợ điều phối).*

## 4. QUY TRÌNH TRIỂN KHAI ĐÁM MÂY (CLOUD DEPLOYMENT PROTOCOL)

Hệ thống được thiết kế để tách biệt hoàn toàn Frontend, Backend và Database nhằm đảm bảo khả năng chịu tải và bảo mật. Dưới đây là quy trình tái triển khai (Disaster Recovery / Redeployment) từng bước:

### Giai đoạn 1: Khởi tạo Dữ liệu (Turso SQLite Cloud)
1. Đăng nhập vào [Turso](https://turso.tech) và tạo Database mới (VD: `ravenx`).
2. Nếu có dữ liệu cũ, chọn **Upload SQLite File** và up file `ravenx.db` (lưu ý: file phải ở chế độ `WAL mode`). Hoặc dùng script Python để bơm dữ liệu.
3. Copy **Database URL** (bắt buộc phải đổi `libsql://` thành `https://` để tránh lỗi 400 WebSocket trên Vercel Serverless).
4. Bấm **Generate Token** và copy chuỗi mã bảo mật.

### Giai đoạn 2: Triển khai Lõi Xử lý (Vercel Backend)
1. Mở Vercel, import thư mục `backend`.
2. Vào **Settings -> Environment Variables**, thêm 2 biến:
   - `TURSO_DATABASE_URL`: `https://ravenx-...turso.io`
   - `TURSO_AUTH_TOKEN`: `(Mã token vừa copy)`
3. Bấm **Deploy**. Sau khi xong, copy đường link của Backend (VD: `https://backend-theta.vercel.app`).

### Giai đoạn 3: Triển khai Giao diện Tác chiến (Vercel Frontend)
1. Trên Vercel, import thư mục `tactical-ui`.
2. Vào **Settings -> Environment Variables**, thêm 2 biến:
   - `VITE_BACKEND_URL`: `(Link Backend copy ở Giai đoạn 2)`
   - `VITE_GROQ_KEY`: `(Khóa API của AI)`
3. Bấm **Deploy**.
4. Trỏ tên miền tùy chỉnh (Domain) nếu cần thiết (VD: `ravenx-protocol.vercel.app`).

---
<div align="center">
  <code>[END OF REPORT - DESTROY THIS FILE IMMEDIATELY AFTER READING]</code>
</div>
