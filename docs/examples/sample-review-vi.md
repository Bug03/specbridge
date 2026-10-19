# Báo cáo review PR: Ngăn tạo đơn và thanh toán trùng

> **Bản minh họa tổng hợp.** Repo, ticket, commit, đường dẫn mã nguồn và findings trong tài liệu này hoàn toàn hư cấu. Đây không phải review của một dự án thật và không chứa nội dung từ PR riêng tư.

| | |
| --- | --- |
| **Repo / PR** | `HarborCart/commerce-api` · PR `#1842` |
| **Thay đổi** | Thêm xử lý retry cho bước thanh toán trong checkout |
| **Phiên bản được review** | Base `4f81a62` · Head `9d3b7c1` *(mã minh họa)* |
| **Kết luận** | **Cần sửa trước khi merge** |
| **Findings** | 2 mục có thể xử lý · 1 mức P1 · 1 mức P3 |

## Tóm tắt cho nhóm

> Người mua có thể gửi lại yêu cầu checkout sau khi kết nối chập chờn. Luồng mới chưa giữ cùng một khóa idempotency cho các lần gửi lại, nên cổng thanh toán có thể tạo giao dịch thứ hai trong khi giao dịch đầu đã được chấp nhận. Ngoài ra, khi thanh toán bị từ chối, lượng hàng đã giữ chỉ được trả lại sau khi reservation hết hạn.

**Tác động chính:** nguy cơ khách bị thu tiền hai lần; hàng còn tồn có thể tạm thời không bán được sau một lần thanh toán thất bại.

**Khuyến nghị:** chặn việc phát hành cho tới khi retry của cùng checkout được hợp nhất thành một đơn/giao dịch. Việc giải phóng reservation sớm hơn thời hạn 30 phút là cải thiện không chặn merge nếu nhóm chấp nhận TTL hiện tại.

## Business Review

**Status: Not Approved** — Tiêu chí một checkout chỉ tạo tối đa một đơn và một giao dịch chưa đạt.

Review này dùng hai tiêu chí chấp nhận giả lập cho ticket `HC-184`:

| Yêu cầu / hành vi mong đợi | Đánh giá | Căn cứ |
| --- | --- | --- |
| Gửi lại cùng một checkout sau timeout chỉ tạo tối đa một đơn và một khoản thanh toán. | **Chưa đạt** | Mỗi lần gọi lại tạo `orderId` mới; header `Idempotency-Key` nhận ở API chưa được chuyển tiếp đến lớp thanh toán. Xem finding **F-01**. |
| Reservation sau khi thanh toán thất bại phải được giải phóng không muộn hơn 30 phút. | **Đạt** | Reservation có thời hạn tự hết hạn tối đa 30 phút. Giải phóng sớm hơn vẫn có lợi cho khách nhưng không phải tiêu chí chặn trong ví dụ này. |

### Hành trình người dùng bị ảnh hưởng

1. Khách xác nhận giỏ hàng và trình duyệt gửi yêu cầu thanh toán.
2. Nhà cung cấp nhận thanh toán nhưng phản hồi bị timeout trên đường về.
3. Khách thử lại vì không thấy kết quả.
4. Backend tạo `orderId` mới, nên yêu cầu thử lại không còn được nhận diện là cùng một checkout.

Ở hành trình khác, nếu ngân hàng từ chối thanh toán, màn hình báo thất bại nhưng lượng hàng có thể vẫn bị giữ cho tới khi reservation hết hạn. Điều này làm trạng thái tồn kho trong thời gian đó khác với kỳ vọng của khách và đội vận hành.

### Điểm làm tốt

- Hệ thống giữ hàng trước khi gọi nhà cung cấp, giảm khả năng bán vượt tồn trong luồng bình thường.
- Kết quả thất bại được ghi lại trên đơn thay vì để đơn ở trạng thái đang xử lý vô thời hạn.
- API đã nhận `Idempotency-Key`; có thể tận dụng hợp đồng hiện tại để sửa mà không cần thêm một cơ chế retry riêng ở client.

### Ngoài phạm vi / chưa xác định

- Chưa có yêu cầu trong ticket minh họa về thời gian tối đa cho trạng thái pending hoặc cách hoàn tiền khi capture thành công nhưng bước ghi đơn thất bại.
- Chưa xem xét đối soát giao dịch và xử lý thủ công bởi bộ phận hỗ trợ.
- Các tiêu chí trên là dữ liệu mẫu; ở một lần review thật cần liên kết tới Jira/OpenSpec và commit nguồn tương ứng.

## Technical Review

**Status: Not Approved** — Finding F-01 vẫn chặn; F-02 là follow-up không chặn nếu nhóm chấp nhận TTL hiện tại.

### F-01 · P1 · Khả năng trung bình

**Retry sau timeout có thể tạo thêm đơn và thu tiền lần nữa**

- **Vị trí:** `src/checkout/submit.ts:48-70`; `src/orders/create.ts:22-30`; `src/payments/gateway.ts:31-45` *(đường dẫn và dòng minh họa)*
- **Nguồn gốc:** Được đưa vào bởi PR minh họa; API nhận khóa idempotency nhưng luồng mới không chuyển khóa đó qua service tạo đơn và thanh toán.
- **Chặn approval:** Có — chưa có cơ chế chứng minh retry không thể tạo giao dịch thứ hai.
- **Tình huống tái hiện:** Nhà cung cấp đã nhận giao dịch đầu tiên nhưng phản hồi bị mất. Client gửi lại cùng checkout. Backend tạo `orderId` khác và dùng ID mới làm khóa của nhà cung cấp; giao dịch thứ hai vì vậy không được gộp với giao dịch đầu.
- **Tác động:** Khách có thể bị ghi nhận hai đơn và hai lần thu tiền cho cùng một lần mua. Bộ phận hỗ trợ phải tra soát hoặc hoàn tiền.
- **Bằng chứng / đường đi:** `submitCheckout()` đọc header nhưng gọi `createOrder()` mà không truyền giá trị đó; `createOrder()` sinh ID ở mỗi lần gọi; `charge()` dùng ID đơn làm idempotency key của nhà cung cấp.
- **Hướng sửa:** Gắn một khóa ổn định với một checkout logic, lưu khóa cùng kết quả để replay trả về cùng đơn, và đặt unique constraint ở tầng dữ liệu. Truyền khóa đó đến nhà cung cấp thanh toán.
- **Kiểm tra cần bổ sung:** Mô phỏng timeout sau khi provider đã nhận request, gửi lại cùng khóa tuần tự và đồng thời; xác nhận chỉ có một order và một charge.
- **Giả định / yếu tố có thể hạ mức:** Finding giả định provider chấp nhận request thứ hai khi nhận ID mới. Nếu một lớp khác đã cưỡng chế uniqueness theo checkout session, cần kiểm tra lớp đó trước khi giữ mức P1.

### F-02 · P3 · Khả năng cao

**Reservation không được giải phóng ngay khi thanh toán thất bại**

- **Vị trí:** `src/checkout/confirm.ts:73-91`; `src/inventory/reserve.ts:14-27` *(đường dẫn và dòng minh họa)*
- **Nguồn gốc:** Được đưa vào bởi PR minh họa; nhánh bắt lỗi chỉ cập nhật trạng thái đơn.
- **Tình huống tái hiện:** Có một sản phẩm cuối cùng. Checkout giữ sản phẩm rồi gửi thanh toán; provider trả về declined. Đơn chuyển sang `failed`, nhưng reservation còn hiệu lực thêm tối đa 30 phút.
- **Tác động:** Khách tiếp theo không mua được mặt hàng dù giao dịch trước đã thất bại; tồn kho chỉ trở lại sau khi tác vụ hết hạn chạy.
- **Chặn approval:** Không — tiêu chí mẫu cho phép reservation hết hạn trong tối đa 30 phút; có thể theo dõi như một cải thiện trải nghiệm.
- **Bằng chứng / đường đi:** `confirmPayment()` gọi `markFailed()` rồi trả lỗi mà không gọi `releaseReservation()`. Reservation chỉ có cơ chế tự hết hạn.
- **Hướng sửa:** Gọi thao tác release idempotent trong nhánh declined/error, bảo đảm thao tác có thể retry nếu kho tạm thời không sẵn sàng. Giữ tác vụ hết hạn làm lớp dự phòng.
- **Kiểm tra cần bổ sung:** Provider từ chối, timeout, và trả lỗi không xác định; mỗi trường hợp phải không giữ hàng quá giới hạn đã cam kết.
- **Giả định / yếu tố có thể hạ mức:** Finding này không chặn nếu TTL và tác vụ dọn reservation đáp ứng cam kết sản phẩm. Nếu PM yêu cầu giải phóng ngay sau khi bị từ chối, cần nâng thành tiêu chí bắt buộc và đánh giá lại mức độ.

F-02 có thể được chấp nhận hoặc giao làm follow-up mà không đổi status của Technical Review. Khi F-01 được xử lý, Technical Review có thể là **Approved** dù F-02 vẫn còn mở.

## Coverage & Limits

| Khu vực | Trạng thái | Ghi chú |
| --- | --- | --- |
| API checkout và truyền dữ liệu xuống service | Đã xem | Tập trung vào header idempotency và tạo order. |
| Tích hợp cổng thanh toán | Đã xem một phần | Kịch bản provider được mô phỏng; chưa kiểm chứng hành vi của một nhà cung cấp thật. |
| Reservation và cập nhật tồn kho | Đã xem | Luồng reserve, fail và expiry trong ví dụ. |
| Kiểm tra tự động | Chưa chạy | Đây là tài liệu mẫu; không có CI hoặc repository thật được kiểm tra. |
| Jira/OpenSpec | Chỉ dùng tiêu chí giả lập | Không có ticket hoặc spec thật được truy cập. |

**Cơ sở review:** nội dung PR giả lập, hai tiêu chí chấp nhận mẫu, và các đoạn code minh họa trong tài liệu này. Trong một report thật, mọi đường dẫn phải trỏ tới head SHA đã pin và được kiểm tra lại trước khi phát hành kết quả.

## Gợi ý triage

| Finding | Đề xuất | Điều kiện đóng |
| --- | --- | --- |
| F-01 | **Fix trước merge** | Cùng checkout retry không tạo thêm order/charge; test cả retry đồng thời. |
| F-02 | **Follow-up không chặn** | Tối ưu thời gian trả hàng sau decline nếu nhóm muốn cải thiện khả năng mua lại trong thời gian TTL. |

---

*SpecBridge sample review · Synthetic data · Không phải nhận định về một PR hoặc dự án có thật.*
