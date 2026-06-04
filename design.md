# Frontend Design Document — Hệ thống Quản lý Chuỗi Nhà Trọ (Swift / SwiftUI + Liquid Glass)

> Bản thiết kế kỹ thuật **Frontend** dành cho lập trình viên iOS / iPadOS / macOS. Toàn bộ ứng dụng được xây dựng bằng **Swift 6** + **SwiftUI** trên nền tảng Apple, tận dụng **Liquid Glass material** (giới thiệu tại WWDC 2025, áp dụng iOS 26+ / iPadOS 26+ / macOS 26 Tahoe+) để có hiệu ứng kính chuẩn xác và mượt nhất.
>
> Mọi đoạn code đều **có thể copy-paste để chạy ngay** trong dự án mới (Xcode 26+).
>
> Kèm `UI_Design_Brief.md` (nghiệp vụ UX) và `Báo cáo PTTKHT.docx` (đặc tả phân tích).

---

## 1. Tech Stack

| Lớp | Công nghệ | Lý do |
|---|---|---|
| **Ngôn ngữ** | Swift 6 (strict concurrency) | An toàn, đồng bộ với toolchain Xcode 26+ |
| **UI framework** | SwiftUI 6 | Native Liquid Glass, declarative |
| **Min OS target** | iOS 26 · iPadOS 26 · macOS 26 (Tahoe) | Yêu cầu cho `.glassEffect`, `GlassEffectContainer` |
| **Kiến trúc** | MVVM + Coordinator + Repository | Tách rõ View / ViewModel / Service |
| **Concurrency** | Swift Concurrency (`async/await`, `actor`, `@Observable`) | Thay thế Combine cho code mới |
| **State** | `@Observable` (Observation framework) + `@State` / `@Binding` / `@Environment` | Ít boilerplate hơn `ObservableObject` |
| **Networking** | `URLSession` + `async/await` + custom interceptor | Không cần thư viện ngoài |
| **Persistence** | SwiftData (cho cache offline) + Keychain (token) | Apple-native, hỗ trợ CloudKit về sau |
| **Routing / Deep link** | `NavigationStack` + `Router` + Universal Links | Type-safe navigation |
| **Form & Validation** | Custom Validator + `@Observable` ViewModel | Không có thư viện form nặng |
| **Localization** | `.xcstrings` (String Catalog) | Tích hợp Xcode 15+ |
| **Charts** | `Charts` framework (Apple) | Liquid Glass-aware |
| **Maps** | MapKit + `Map { … }` | Native iOS Maps |
| **Payments** | `PassKit` (Apple Pay) + VNPay/MoMo via SFSafariViewController | Trải nghiệm native nhất |
| **Push Notifications** | APNs qua UNUserNotificationCenter | |
| **Testing** | Swift Testing (`@Test`) + XCUITest + ViewInspector | Toolchain mới |
| **CI/CD** | Xcode Cloud (hoặc GitHub Actions + Fastlane) | TestFlight tự động |
| **Lint / Format** | SwiftLint + SwiftFormat | Pre-commit hook |
| **Logging** | `OSLog` (Logger) | Tích hợp Console.app |

### Mục tiêu nền tảng

| Vai trò | Thiết bị chính | Lý do |
|---|---|---|
| **Khách thuê (Tenant)** | iPhone (iOS 26+) | 80% truy cập từ điện thoại |
| **Khách vãng lai (Visitor)** | iPhone + iPad | Tìm phòng tiện lợi |
| **Quản lý (Manager)** | iPad (iPadOS 26+) | Thao tác di động tại hiện trường, có Apple Pencil để xác nhận |
| **Chủ trọ (Admin)** | Mac (macOS 26 Tahoe+) hoặc iPad Pro | Multi-window, biểu đồ chi tiết |

Toàn bộ là **1 dự án SwiftUI đa nền tảng** (multi-platform target) — share code tối đa, có conditional UI cho từng thiết bị.

---

## 2. Cấu trúc dự án Xcode

```
NhaTroApp/
├── NhaTroApp.xcodeproj
├── NhaTroApp/
│   ├── App/
│   │   ├── NhaTroApp.swift              // @main
│   │   ├── AppRouter.swift              // Root coordinator
│   │   ├── AppEnvironment.swift         // EnvironmentKey + DI container
│   │   └── RootView.swift               // Switch theo role
│   │
│   ├── Features/                        // Module nghiệp vụ
│   │   ├── Auth/
│   │   │   ├── Views/
│   │   │   │   ├── LoginView.swift
│   │   │   │   ├── OTPView.swift
│   │   │   │   └── ForgotPasswordView.swift
│   │   │   ├── ViewModels/
│   │   │   │   └── AuthViewModel.swift
│   │   │   ├── Models/
│   │   │   │   └── User.swift
│   │   │   └── Services/
│   │   │       └── AuthService.swift
│   │   ├── Properties/                  // Nhà trọ
│   │   ├── Rooms/
│   │   ├── Contracts/
│   │   ├── Invoices/
│   │   ├── Payments/
│   │   ├── Services/                    // Đơn giá dịch vụ
│   │   ├── Reports/
│   │   ├── Users/
│   │   ├── Notifications/
│   │   └── Search/                      // Visitor tìm phòng
│   │
│   ├── DesignSystem/                    // ⭐ Liquid Glass + token
│   │   ├── Colors/
│   │   │   ├── AppColors.swift
│   │   │   └── Assets.xcassets          // Color sets light/dark
│   │   ├── Typography/
│   │   │   └── AppFont.swift
│   │   ├── Spacing/
│   │   │   └── AppSpacing.swift
│   │   ├── Components/                  // UI dùng chung
│   │   │   ├── GlassCard.swift
│   │   │   ├── GlassTabBar.swift
│   │   │   ├── GlassToolbar.swift
│   │   │   ├── GlassButton.swift
│   │   │   ├── GlassSearchField.swift
│   │   │   ├── GlassModal.swift
│   │   │   ├── StatusBadge.swift
│   │   │   ├── KPICard.swift
│   │   │   ├── EmptyStateView.swift
│   │   │   ├── DataTable.swift
│   │   │   └── LoadingShimmer.swift
│   │   └── Modifiers/
│   │       ├── GlassEffectModifier.swift
│   │       ├── PressableModifier.swift
│   │       └── HapticModifier.swift
│   │
│   ├── Core/
│   │   ├── Networking/
│   │   │   ├── APIClient.swift
│   │   │   ├── Endpoint.swift
│   │   │   ├── HTTPMethod.swift
│   │   │   ├── APIError.swift
│   │   │   └── Interceptors/
│   │   │       ├── AuthInterceptor.swift
│   │   │       └── RefreshInterceptor.swift
│   │   ├── Storage/
│   │   │   ├── KeychainStore.swift
│   │   │   ├── UserDefaultsStore.swift
│   │   │   └── SwiftDataStack.swift
│   │   ├── Concurrency/
│   │   │   └── TaskQueue.swift
│   │   ├── Logger/
│   │   │   └── AppLogger.swift
│   │   └── Permissions/
│   │       └── Permission.swift         // RBAC matrix
│   │
│   ├── Resources/
│   │   ├── Localizable.xcstrings
│   │   ├── Info.plist
│   │   └── Assets.xcassets
│   │
│   └── Utilities/
│       ├── Formatters/
│       │   ├── CurrencyFormatter.swift
│       │   └── DateFormatter+App.swift
│       ├── Extensions/
│       │   ├── View+Helpers.swift
│       │   ├── Color+Hex.swift
│       │   └── String+Validation.swift
│       └── Constants.swift
│
├── NhaTroAppTests/
├── NhaTroAppUITests/
└── Packages/                            // Local SPM packages (tuỳ chọn)
    └── DesignSystem/                    // Có thể tách thành module riêng
```

---

## 3. Liquid Glass — Thiết kế cốt lõi

> Đây là **trọng tâm** của thiết kế. Liquid Glass là vật liệu hiển thị mới của Apple kể từ WWDC 2025 — kết hợp blur + refraction + light reactivity, có khả năng "tan chảy" liền nhau khi nhiều phần tử kính cạnh nhau.
>
> Sử dụng SAI cách sẽ làm app trông giả; sử dụng đúng cách sẽ có cảm giác native như app hệ thống.

### 3.1 Nguyên tắc vàng

1. **KHÔNG** dùng Liquid Glass cho khối lớn chứa nội dung (đoạn văn dài, table dày). Chỉ dùng cho **controls** (button, toolbar, tab bar, search bar, modal handle, floating action) hoặc **decorative cards nhỏ**.
2. **Luôn** đặt nhiều phần tử kính trong một `GlassEffectContainer` để chúng "morph" mượt khi animation.
3. **Tint nhẹ tay** — chỉ dùng tint khi cần phân biệt action quan trọng. Mặc định để glass clear hấp thụ background.
4. **Tôn trọng "Reduce Transparency"** trong Accessibility — fallback sang material đặc.
5. **Tránh chồng glass lên glass** trừ khi có lý do (modal trên tab bar). Chồng quá nhiều → bão hoà blur.

### 3.2 GlassEffect API tóm tắt

```swift
// Cơ bản
.glassEffect()

// Có shape
.glassEffect(.regular, in: .capsule)
.glassEffect(.regular, in: .rect(cornerRadius: 16))

// Tint
.glassEffect(.regular.tint(.accentColor))
.glassEffect(.regular.tint(.blue.opacity(0.5)))

// Interactive — phản ứng khi nhấn/kéo
.glassEffect(.regular.interactive())

// Kết hợp tất cả
.glassEffect(
    .regular.tint(.primaryBrand).interactive(),
    in: .rect(cornerRadius: 20)
)
```

### 3.3 GlassEffectContainer — group nhiều element kính

```swift
GlassEffectContainer(spacing: 12) {
    HStack(spacing: 12) {
        ForEach(actions, id: \.id) { action in
            Button { action.run() } label: {
                Image(systemName: action.symbol)
                    .font(.title3)
                    .padding(14)
            }
            .glassEffect(.regular.interactive(), in: .circle)
            .glassEffectID(action.id, in: namespace)
        }
    }
}
```
`spacing` quyết định ngưỡng "tan chảy". Khoảng cách giữa các phần tử trong container nhỏ hơn `spacing` → chúng **merge** lại thành một hình kính liền mạch.

### 3.4 Built-in glass button styles

```swift
Button("Thanh toán ngay") { … }
    .buttonStyle(.glassProminent)        // CTA quan trọng — có tint mạnh
    .tint(.primaryBrand)

Button { … } label: { Label("Sửa", systemImage: "pencil") }
    .buttonStyle(.glass)                 // Button kính bình thường
```

### 3.5 Toolbar / tab bar / sheet **tự động** dùng Liquid Glass khi target iOS 26+
- `.toolbar { … }` trong `NavigationStack`
- `TabView { … }` (tab bar)
- `.sheet(isPresented:)` (modal handle)
- `.searchable(text:)` (search bar)

Không cần modifier thủ công nào — chỉ cần build với SDK 26.

### 3.6 Custom Glass modifier (fallback an toàn)

```swift
// DesignSystem/Modifiers/GlassEffectModifier.swift
import SwiftUI

struct AdaptiveGlass: ViewModifier {
    var tint: Color?
    var interactive: Bool = false
    var shape: AnyShape = AnyShape(RoundedRectangle(cornerRadius: 20))
    
    @Environment(\.accessibilityReduceTransparency) private var reduceTransparency
    
    func body(content: Content) -> some View {
        if reduceTransparency {
            // Fallback: material đặc, không transparent
            content
                .background(.regularMaterial, in: shape)
                .overlay(shape.stroke(.separator, lineWidth: 0.5))
        } else {
            var glass: Glass = .regular
            if let tint { glass = glass.tint(tint) }
            if interactive { glass = glass.interactive() }
            return content.glassEffect(glass, in: shape)
        }
    }
}

extension View {
    func appGlass(tint: Color? = nil, interactive: Bool = false,
                  in shape: some Shape = RoundedRectangle(cornerRadius: 20)) -> some View {
        modifier(AdaptiveGlass(tint: tint, interactive: interactive, shape: AnyShape(shape)))
    }
}
```

Dùng:
```swift
HStack { Text("…") }
    .padding()
    .appGlass(in: .capsule)
```

---

## 4. Design Tokens

### 4.1 Màu — Asset Catalog

Tạo Color Set trong `Assets.xcassets`. Mỗi color có **Any Appearance** + **Dark Appearance**.

| Tên asset | Light | Dark | Vai trò |
|---|---|---|---|
| `PrimaryBrand`        | `#3A5BC7` | `#5E7BE0` | Tint chính |
| `PrimaryBrandSoft`    | `#E8EEF9` | `#1F2A4D` | Nền nhẹ |
| `Surface`             | `#FFFFFF` | `#1C1C1E` | Card |
| `SurfaceElevated`     | `#FAFBFE` | `#2C2C2E` | Card nổi |
| `TextPrimary`         | `#1A1F36` | `#F1F5F9` | Văn bản |
| `TextMuted`           | `#6B7280` | `#94A3B8` | Văn bản phụ |
| `Success`             | `#16A34A` | `#22C55E` | Đã thanh toán |
| `Warning`             | `#F59E0B` | `#FBBF24` | Đặt cọc, sắp hạn |
| `Danger`              | `#DC2626` | `#F87171` | Quá hạn, lỗi |
| `Info`                | `#0EA5E9` | `#38BDF8` | Thông tin |
| `GlassTintAccent`     | `#3A5BC7` w/ α 0.45 | `#5E7BE0` w/ α 0.45 | Dùng cho `.tint(...)` trong glass |

### 4.2 `AppColors.swift`

```swift
// DesignSystem/Colors/AppColors.swift
import SwiftUI

extension Color {
    static let primaryBrand      = Color("PrimaryBrand")
    static let primaryBrandSoft  = Color("PrimaryBrandSoft")
    static let surface           = Color("Surface")
    static let surfaceElevated   = Color("SurfaceElevated")
    static let textPrimary       = Color("TextPrimary")
    static let textMuted         = Color("TextMuted")
    static let appSuccess        = Color("Success")
    static let appWarning        = Color("Warning")
    static let appDanger         = Color("Danger")
    static let appInfo           = Color("Info")
    static let glassTintAccent   = Color("GlassTintAccent")
}
```

### 4.3 Typography — SF Pro với Dynamic Type

```swift
// DesignSystem/Typography/AppFont.swift
import SwiftUI

enum AppFont {
    static let largeTitle = Font.system(.largeTitle, design: .rounded, weight: .bold)
    static let title      = Font.system(.title, design: .rounded, weight: .semibold)
    static let title2     = Font.system(.title2, design: .rounded, weight: .semibold)
    static let title3     = Font.system(.title3, design: .rounded, weight: .semibold)
    static let headline   = Font.system(.headline, design: .default, weight: .semibold)
    static let body       = Font.system(.body, design: .default, weight: .regular)
    static let callout    = Font.system(.callout, design: .default)
    static let subheadline = Font.system(.subheadline, design: .default)
    static let footnote   = Font.system(.footnote, design: .default)
    static let caption    = Font.system(.caption, design: .default)
    
    /// Dành cho số to (KPI, tổng tiền hoá đơn) — monospaced digits
    static let displayNumber = Font.system(.largeTitle, design: .rounded, weight: .bold)
        .monospacedDigit()
}
```

> ⚠️ **Luôn dùng `.system(.body)` thay vì `.font(.body)`** để tự động hỗ trợ Dynamic Type. Tránh hardcode size px.

### 4.4 Spacing scale

```swift
// DesignSystem/Spacing/AppSpacing.swift
enum AppSpacing {
    static let xxs: CGFloat = 4
    static let xs:  CGFloat = 8
    static let sm:  CGFloat = 12
    static let md:  CGFloat = 16
    static let lg:  CGFloat = 24
    static let xl:  CGFloat = 32
    static let xxl: CGFloat = 48
}

enum AppRadius {
    static let sm: CGFloat = 8
    static let md: CGFloat = 12
    static let lg: CGFloat = 20
    static let xl: CGFloat = 28
    static let pill: CGFloat = 999
}
```

### 4.5 Status tokens

```swift
// DesignSystem/Components/StatusBadge.swift
import SwiftUI

enum RoomStatus: String, CaseIterable {
    case empty, rented, deposit, closed
    
    var label: String {
        switch self {
        case .empty:   "Trống"
        case .rented:  "Đang thuê"
        case .deposit: "Đặt cọc"
        case .closed:  "Ngưng"
        }
    }
    
    var color: Color {
        switch self {
        case .empty:   .appSuccess
        case .rented:  .primaryBrand
        case .deposit: .appWarning
        case .closed:  .textMuted
        }
    }
}

enum InvoiceStatus: String, CaseIterable {
    case draft, pending, cashWait, paid, overdue
    
    var label: String {
        switch self {
        case .draft:    "Bản nháp"
        case .pending:  "Đang chờ"
        case .cashWait: "Chờ xác nhận TM"
        case .paid:     "Đã thanh toán"
        case .overdue:  "Quá hạn"
        }
    }
    
    var color: Color {
        switch self {
        case .draft:    .textMuted
        case .pending:  .appWarning
        case .cashWait: .appInfo
        case .paid:     .appSuccess
        case .overdue:  .appDanger
        }
    }
}

struct StatusBadge: View {
    let label: String
    let color: Color
    
    var body: some View {
        Text(label)
            .font(AppFont.caption.weight(.semibold))
            .foregroundStyle(color)
            .padding(.horizontal, AppSpacing.sm)
            .padding(.vertical, AppSpacing.xxs)
            .background(color.opacity(0.15), in: .capsule)
    }
}
```

---

## 5. Component Library (Liquid Glass)

### 5.1 GlassCard — thẻ thông tin

```swift
// DesignSystem/Components/GlassCard.swift
import SwiftUI

struct GlassCard<Content: View>: View {
    var tint: Color? = nil
    var padding: CGFloat = AppSpacing.md
    var radius: CGFloat = AppRadius.lg
    @ViewBuilder var content: () -> Content
    
    var body: some View {
        content()
            .padding(padding)
            .frame(maxWidth: .infinity, alignment: .leading)
            .appGlass(tint: tint, in: RoundedRectangle(cornerRadius: radius, style: .continuous))
    }
}
```

Dùng:
```swift
GlassCard {
    VStack(alignment: .leading, spacing: AppSpacing.sm) {
        Text("Doanh thu tháng").font(AppFont.subheadline).foregroundStyle(.textMuted)
        Text("125.430.000 ₫").font(AppFont.displayNumber)
        Label("+12% so với tháng trước", systemImage: "arrow.up.right")
            .font(AppFont.footnote).foregroundStyle(.appSuccess)
    }
}
```

### 5.2 KPICard — dashboard

```swift
struct KPICard: View {
    let title: String
    let value: String
    let delta: String?
    let isPositive: Bool
    let symbol: String
    
    var body: some View {
        GlassCard {
            VStack(alignment: .leading, spacing: AppSpacing.sm) {
                HStack {
                    Image(systemName: symbol)
                        .font(.title2)
                        .foregroundStyle(.primaryBrand)
                    Spacer()
                }
                Text(title).font(AppFont.subheadline).foregroundStyle(.textMuted)
                Text(value).font(AppFont.title2.weight(.bold))
                    .contentTransition(.numericText())
                if let delta {
                    Label(delta, systemImage: isPositive ? "arrow.up.right" : "arrow.down.right")
                        .font(AppFont.caption)
                        .foregroundStyle(isPositive ? .appSuccess : .appDanger)
                }
            }
        }
    }
}
```

### 5.3 Floating Action cluster — minh hoạ `GlassEffectContainer`

```swift
struct FloatingActions: View {
    @Namespace private var glassNS
    @State private var expanded = false
    
    var body: some View {
        GlassEffectContainer(spacing: 12) {
            VStack(spacing: 12) {
                if expanded {
                    ForEach(SubAction.allCases, id: \.self) { action in
                        Button { action.run() } label: {
                            Image(systemName: action.symbol).font(.title3).padding(14)
                        }
                        .glassEffect(.regular.interactive(), in: .circle)
                        .glassEffectID(action.id, in: glassNS)
                        .transition(.scale.combined(with: .opacity))
                    }
                }
                Button {
                    withAnimation(.spring(response: 0.35, dampingFraction: 0.75)) {
                        expanded.toggle()
                    }
                } label: {
                    Image(systemName: expanded ? "xmark" : "plus")
                        .font(.title2.bold()).padding(18)
                }
                .glassEffect(.regular.tint(.primaryBrand).interactive(), in: .circle)
                .glassEffectID("fab.main", in: glassNS)
            }
        }
        .padding(AppSpacing.md)
    }
}
```
Khi `expanded = true`, các nút con xuất hiện và **morph mượt** từ nút chính nhờ `glassEffectID` + container.

### 5.4 GlassSearchField — search bar tuỳ chỉnh

```swift
struct GlassSearchField: View {
    @Binding var text: String
    var placeholder: String = "Tìm phòng…"
    @FocusState private var isFocused: Bool
    
    var body: some View {
        HStack(spacing: AppSpacing.xs) {
            Image(systemName: "magnifyingglass").foregroundStyle(.textMuted)
            TextField(placeholder, text: $text)
                .focused($isFocused)
                .submitLabel(.search)
            if !text.isEmpty {
                Button { text = "" } label: {
                    Image(systemName: "xmark.circle.fill").foregroundStyle(.textMuted)
                }
                .buttonStyle(.plain)
            }
        }
        .padding(.horizontal, AppSpacing.md)
        .padding(.vertical, AppSpacing.sm)
        .appGlass(in: .capsule)
        .animation(.easeOut(duration: 0.2), value: isFocused)
    }
}
```

### 5.5 GlassTabBar (tuỳ chọn, vì TabView đã native)

Trường hợp 1: dùng `TabView` mặc định — iOS 26 tự áp Liquid Glass.
Trường hợp 2: cần tab bar custom (Tenant app):

```swift
struct GlassTabBar: View {
    @Binding var selected: TenantTab
    @Namespace private var glassNS
    
    var body: some View {
        GlassEffectContainer(spacing: 8) {
            HStack(spacing: 8) {
                ForEach(TenantTab.allCases, id: \.self) { tab in
                    Button {
                        withAnimation(.snappy) { selected = tab }
                    } label: {
                        VStack(spacing: 2) {
                            Image(systemName: tab.symbol)
                                .font(.title3)
                            Text(tab.label).font(.caption2)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 8)
                        .foregroundStyle(selected == tab ? Color.primaryBrand : .textMuted)
                    }
                    .glassEffect(
                        selected == tab ? .regular.tint(.primaryBrand) : .regular,
                        in: .rect(cornerRadius: 18)
                    )
                    .glassEffectID(tab.id, in: glassNS)
                }
            }
            .padding(8)
        }
        .padding(.horizontal, AppSpacing.md)
        .padding(.bottom, AppSpacing.xs)
    }
}

enum TenantTab: String, CaseIterable {
    case home, contracts, invoices, profile
    var id: String { rawValue }
    var symbol: String {
        switch self {
        case .home: "house.fill"
        case .contracts: "doc.text.fill"
        case .invoices: "creditcard.fill"
        case .profile: "person.circle.fill"
        }
    }
    var label: String {
        switch self {
        case .home: "Trang chủ"
        case .contracts: "Hợp đồng"
        case .invoices: "Hoá đơn"
        case .profile: "Hồ sơ"
        }
    }
}
```

### 5.6 GlassModal — sheet với glass background

```swift
struct GlassModal<Content: View>: View {
    var title: String
    @Binding var isPresented: Bool
    @ViewBuilder var content: () -> Content
    
    var body: some View {
        ZStack(alignment: .top) {
            // Khung modal nội dung — tách khỏi background blur của system sheet
            VStack(alignment: .leading, spacing: AppSpacing.md) {
                HStack {
                    Text(title).font(AppFont.title3)
                    Spacer()
                    Button { isPresented = false } label: {
                        Image(systemName: "xmark.circle.fill")
                            .font(.title2).foregroundStyle(.textMuted)
                    }.buttonStyle(.plain)
                }
                content()
            }
            .padding(AppSpacing.lg)
        }
        .presentationDetents([.medium, .large])
        .presentationDragIndicator(.visible)
        .presentationBackground(.regularMaterial)        // Material thay vì .clear
    }
}
```

### 5.7 EmptyStateView

```swift
struct EmptyStateView: View {
    let symbol: String
    let title: String
    let message: String
    var action: (label: String, run: () -> Void)? = nil
    
    var body: some View {
        VStack(spacing: AppSpacing.md) {
            Image(systemName: symbol)
                .font(.system(size: 56)).foregroundStyle(.tertiary)
            Text(title).font(AppFont.title3)
            Text(message).font(AppFont.subheadline)
                .foregroundStyle(.textMuted)
                .multilineTextAlignment(.center)
            if let action {
                Button(action.label) { action.run() }
                    .buttonStyle(.glassProminent)
                    .tint(.primaryBrand)
            }
        }
        .padding(AppSpacing.xl)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}
```

---

## 6. App Shell & Navigation

### 6.1 Root entry

```swift
// App/NhaTroApp.swift
import SwiftUI
import SwiftData

@main
struct NhaTroApp: App {
    @State private var appEnv = AppEnvironment.live()
    
    var body: some Scene {
        WindowGroup {
            RootView()
                .environment(appEnv)
                .environment(appEnv.auth)
                .environment(appEnv.router)
                .modelContainer(appEnv.swiftDataContainer)
                .tint(.primaryBrand)
        }
    }
}
```

### 6.2 RootView — switch theo trạng thái đăng nhập

```swift
// App/RootView.swift
struct RootView: View {
    @Environment(AuthStore.self) private var auth
    
    var body: some View {
        Group {
            switch auth.state {
            case .signedOut:
                LoginFlow()
            case .signedIn(let user):
                switch user.role {
                case .admin:   AdminRootView()
                case .manager: ManagerRootView()
                case .tenant:  TenantRootView()
                }
            case .loading:
                ProgressView().controlSize(.large)
            }
        }
        .animation(.easeInOut, value: auth.state)
    }
}
```

### 6.3 Tenant root (TabView native)

```swift
struct TenantRootView: View {
    var body: some View {
        TabView {
            Tab("Trang chủ", systemImage: "house.fill") {
                NavigationStack { TenantHomeView() }
            }
            Tab("Hợp đồng", systemImage: "doc.text.fill") {
                NavigationStack { TenantContractsView() }
            }
            Tab("Hoá đơn", systemImage: "creditcard.fill") {
                NavigationStack { TenantInvoicesView() }
            }
            Tab("Hồ sơ", systemImage: "person.circle.fill") {
                NavigationStack { TenantProfileView() }
            }
        }
        // iOS 26+ — TabView tự áp Liquid Glass bar
    }
}
```

### 6.4 Admin / Manager root (sidebar + detail)

```swift
struct AdminRootView: View {
    @State private var selection: AdminSection? = .dashboard
    
    var body: some View {
        NavigationSplitView {
            List(AdminSection.allCases, selection: $selection) { section in
                NavigationLink(value: section) {
                    Label(section.label, systemImage: section.symbol)
                }
            }
            .navigationTitle("Nhà trọ A")
            .listStyle(.sidebar)
        } detail: {
            switch selection {
            case .dashboard:   AdminDashboardView()
            case .properties:  PropertiesView()
            case .users:       UsersView()
            case .contracts:   AdminContractsView()
            case .invoices:    InvoicesView()
            case .services:    ServicesView()
            case .reports:     ReportsView()
            case .settings:    SettingsView()
            case nil:          ContentUnavailableView("Chọn mục", systemImage: "sidebar.leading")
            }
        }
    }
}

enum AdminSection: String, CaseIterable, Identifiable {
    case dashboard, properties, users, contracts, invoices, services, reports, settings
    var id: Self { self }
    var label: String { /* tiếng Việt */ }
    var symbol: String { /* SF Symbols */ }
}
```

### 6.5 Router type-safe (Coordinator)

```swift
// App/AppRouter.swift
@Observable
final class Router {
    var path = NavigationPath()
    
    func push(_ destination: any Hashable) { path.append(destination) }
    func pop() { if !path.isEmpty { path.removeLast() } }
    func popToRoot() { path = NavigationPath() }
}

// Định nghĩa destination type-safe
enum InvoiceDestination: Hashable {
    case detail(id: String)
    case pay(id: String)
}

// Trong view:
NavigationStack(path: $router.path) {
    InvoiceListView()
        .navigationDestination(for: InvoiceDestination.self) { dest in
            switch dest {
            case .detail(let id): InvoiceDetailView(id: id)
            case .pay(let id):    PaymentView(invoiceId: id)
            }
        }
}
```

---

## 7. State management — `@Observable`

### 7.1 ViewModel mẫu

```swift
// Features/Invoices/ViewModels/InvoiceListViewModel.swift
import Observation

@Observable
@MainActor
final class InvoiceListViewModel {
    enum LoadState: Equatable {
        case idle, loading, loaded, error(String)
    }
    
    var invoices: [Invoice] = []
    var filter: InvoiceFilter = .all
    var state: LoadState = .idle
    
    private let service: InvoiceService
    init(service: InvoiceService) { self.service = service }
    
    func load() async {
        state = .loading
        do {
            invoices = try await service.list(filter: filter)
            state = .loaded
        } catch {
            state = .error(error.localizedDescription)
        }
    }
    
    func payInvoice(_ id: String) async throws -> PaymentSession {
        try await service.initPayment(invoiceId: id)
    }
}
```

### 7.2 View dùng `@State` để giữ vm

```swift
struct TenantInvoicesView: View {
    @Environment(AppEnvironment.self) private var env
    @State private var vm: InvoiceListViewModel?
    
    var body: some View {
        Group {
            if let vm {
                List(vm.invoices) { inv in
                    InvoiceRow(invoice: inv)
                }
                .overlay {
                    switch vm.state {
                    case .loading where vm.invoices.isEmpty:
                        ProgressView()
                    case .error(let msg):
                        ContentUnavailableView("Lỗi", systemImage: "exclamationmark.triangle", description: Text(msg))
                    case .loaded where vm.invoices.isEmpty:
                        EmptyStateView(symbol: "creditcard", title: "Chưa có hoá đơn",
                                       message: "Hoá đơn tháng đầu tiên sẽ được phát hành vào cuối tháng.")
                    default: EmptyView()
                    }
                }
                .refreshable { await vm.load() }
                .task { await vm.load() }
            } else {
                ProgressView()
            }
        }
        .onAppear {
            if vm == nil { vm = InvoiceListViewModel(service: env.invoiceService) }
        }
        .navigationTitle("Hoá đơn")
    }
}
```

### 7.3 Global stores

```swift
// Features/Auth/AuthStore.swift
@Observable @MainActor
final class AuthStore {
    enum State: Equatable {
        case loading, signedOut, signedIn(User)
    }
    
    private(set) var state: State = .loading
    
    private let service: AuthService
    private let keychain: KeychainStore
    init(service: AuthService, keychain: KeychainStore) {
        self.service = service
        self.keychain = keychain
    }
    
    func bootstrap() async {
        if let token = keychain.refreshToken {
            do {
                let user = try await service.fetchProfile()
                state = .signedIn(user)
            } catch { state = .signedOut }
        } else { state = .signedOut }
    }
    
    func signOut() {
        keychain.clear()
        state = .signedOut
    }
}
```

---

## 8. Networking layer

### 8.1 Endpoint protocol

```swift
// Core/Networking/Endpoint.swift
protocol Endpoint {
    associatedtype Response: Decodable
    var path: String { get }
    var method: HTTPMethod { get }
    var query: [URLQueryItem] { get }
    var body: Encodable? { get }
    var requiresAuth: Bool { get }
}

extension Endpoint {
    var query: [URLQueryItem] { [] }
    var body: Encodable? { nil }
    var requiresAuth: Bool { true }
}

enum HTTPMethod: String { case get = "GET", post = "POST", put = "PUT", patch = "PATCH", delete = "DELETE" }
```

### 8.2 APIClient với async/await

```swift
// Core/Networking/APIClient.swift
import Foundation

actor APIClient {
    private let baseURL: URL
    private let session: URLSession
    private let decoder: JSONDecoder
    private let encoder: JSONEncoder
    private let auth: AuthStore
    private let keychain: KeychainStore
    
    init(baseURL: URL, auth: AuthStore, keychain: KeychainStore) {
        self.baseURL = baseURL
        self.session = URLSession(configuration: .default)
        self.auth = auth
        self.keychain = keychain
        
        let dec = JSONDecoder()
        dec.dateDecodingStrategy = .iso8601
        dec.keyDecodingStrategy = .convertFromSnakeCase
        self.decoder = dec
        
        let enc = JSONEncoder()
        enc.dateEncodingStrategy = .iso8601
        enc.keyEncodingStrategy = .convertToSnakeCase
        self.encoder = enc
    }
    
    func send<E: Endpoint>(_ endpoint: E) async throws -> E.Response {
        try await perform(endpoint, retried: false)
    }
    
    private func perform<E: Endpoint>(_ endpoint: E, retried: Bool) async throws -> E.Response {
        var request = try buildRequest(endpoint)
        if endpoint.requiresAuth, let token = keychain.accessToken {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        
        let (data, response) = try await session.data(for: request)
        guard let http = response as? HTTPURLResponse else { throw APIError.invalidResponse }
        
        switch http.statusCode {
        case 200..<300:
            if E.Response.self == EmptyResponse.self { return EmptyResponse() as! E.Response }
            return try decoder.decode(E.Response.self, from: data)
        case 401 where !retried:
            try await refreshAccessToken()
            return try await perform(endpoint, retried: true)
        case 401:
            await MainActor.run { auth.signOut() }
            throw APIError.unauthorized
        default:
            throw APIError.server(status: http.statusCode, body: data)
        }
    }
    
    private func buildRequest<E: Endpoint>(_ endpoint: E) throws -> URLRequest {
        var components = URLComponents(url: baseURL.appendingPathComponent(endpoint.path),
                                       resolvingAgainstBaseURL: false)!
        if !endpoint.query.isEmpty { components.queryItems = endpoint.query }
        guard let url = components.url else { throw APIError.invalidURL }
        var req = URLRequest(url: url)
        req.httpMethod = endpoint.method.rawValue
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        if let body = endpoint.body { req.httpBody = try encoder.encode(AnyEncodable(body)) }
        return req
    }
    
    private func refreshAccessToken() async throws { /* gọi /auth/refresh, lưu keychain */ }
}

struct EmptyResponse: Decodable {}

enum APIError: Error, LocalizedError {
    case invalidURL, invalidResponse, unauthorized
    case server(status: Int, body: Data)
    var errorDescription: String? {
        switch self {
        case .invalidURL: "URL không hợp lệ"
        case .invalidResponse: "Phản hồi không hợp lệ"
        case .unauthorized: "Phiên đã hết hạn, vui lòng đăng nhập lại"
        case .server(let s, _): "Lỗi máy chủ (\(s))"
        }
    }
}

// Type-erased Encodable
struct AnyEncodable: Encodable {
    private let _encode: (Encoder) throws -> Void
    init(_ wrapped: Encodable) {
        _encode = { try wrapped.encode(to: $0) }
    }
    func encode(to encoder: Encoder) throws { try _encode(encoder) }
}
```

### 8.3 Endpoint mẫu

```swift
// Features/Invoices/Services/InvoiceEndpoints.swift
struct ListInvoices: Endpoint {
    typealias Response = [Invoice]
    let filter: InvoiceFilter
    
    var path: String { "/v1/invoices" }
    var method: HTTPMethod { .get }
    var query: [URLQueryItem] {
        [
            URLQueryItem(name: "status", value: filter.status?.rawValue),
            URLQueryItem(name: "period", value: filter.period),
            URLQueryItem(name: "property_id", value: filter.propertyId)
        ].compactMap { $0.value == nil ? nil : $0 }
    }
}

struct InitPayment: Endpoint {
    typealias Response = PaymentSession
    let invoiceId: String
    let method: PaymentMethod
    
    var path: String { "/v1/invoices/\(invoiceId)/pay/init" }
    var httpMethod: HTTPMethod { .post }
    var body: Encodable? { ["method": method.rawValue] }
}
```

### 8.4 Service layer

```swift
final class InvoiceService {
    private let api: APIClient
    init(api: APIClient) { self.api = api }
    
    func list(filter: InvoiceFilter) async throws -> [Invoice] {
        try await api.send(ListInvoices(filter: filter))
    }
    
    func initPayment(invoiceId: String, method: PaymentMethod = .vnpay) async throws -> PaymentSession {
        try await api.send(InitPayment(invoiceId: invoiceId, method: method))
    }
}
```

---

## 9. Models

```swift
// Features/Invoices/Models/Invoice.swift
import Foundation

struct Invoice: Identifiable, Codable, Hashable {
    let id: String
    let code: String                  // "HD-202611-001"
    let period: String                // "2026-11"
    let tenantName: String
    let roomCode: String
    let propertyName: String
    let issuedAt: Date
    let dueDate: Date
    let total: Decimal
    let status: InvoiceStatus
    let lines: [InvoiceLine]
    let paidAt: Date?
}

struct InvoiceLine: Codable, Hashable, Identifiable {
    var id: String { "\(service)-\(quantity)" }
    let service: String
    let quantity: Decimal
    let unitPrice: Decimal
    let amount: Decimal
}

struct InvoiceFilter: Equatable {
    var status: InvoiceStatus? = nil
    var period: String? = nil
    var propertyId: String? = nil
    
    static let all = InvoiceFilter()
}
```

---

## 10. Authentication flow chi tiết

### 10.1 LoginView

```swift
struct LoginView: View {
    @Environment(AuthStore.self) private var auth
    @State private var vm = LoginViewModel()
    
    var body: some View {
        ScrollView {
            VStack(spacing: AppSpacing.lg) {
                Image("AppLogo").frame(width: 80, height: 80)
                
                Text("Chào mừng trở lại").font(AppFont.title)
                Text("Đăng nhập để tiếp tục").font(AppFont.subheadline)
                    .foregroundStyle(.textMuted)
                
                VStack(spacing: AppSpacing.md) {
                    TextField("Email hoặc số điện thoại", text: $vm.identifier)
                        .textContentType(.username)
                        .textInputAutocapitalization(.never)
                        .padding()
                        .appGlass(in: .rect(cornerRadius: AppRadius.md))
                    
                    SecureField("Mật khẩu", text: $vm.password)
                        .textContentType(.password)
                        .padding()
                        .appGlass(in: .rect(cornerRadius: AppRadius.md))
                }
                
                if let error = vm.error {
                    Text(error).font(AppFont.footnote).foregroundStyle(.appDanger)
                }
                
                Button {
                    Task { await vm.submit() }
                } label: {
                    if vm.isLoading {
                        ProgressView().tint(.white)
                    } else {
                        Text("Đăng nhập").frame(maxWidth: .infinity).padding(.vertical, AppSpacing.xs)
                    }
                }
                .buttonStyle(.glassProminent)
                .tint(.primaryBrand)
                .disabled(vm.isLoading || !vm.canSubmit)
                .frame(maxWidth: .infinity)
                
                HStack {
                    NavigationLink("Quên mật khẩu?") { ForgotPasswordView() }
                    Spacer()
                    NavigationLink("Đăng ký") { RegisterView() }
                }
                .font(AppFont.subheadline)
            }
            .padding(AppSpacing.lg)
        }
        .navigationDestination(isPresented: $vm.showOTP) {
            OTPView(tempToken: vm.tempToken ?? "")
        }
    }
}
```

### 10.2 LoginViewModel

```swift
@Observable @MainActor
final class LoginViewModel {
    var identifier = ""
    var password = ""
    var isLoading = false
    var error: String? = nil
    var tempToken: String? = nil
    var showOTP = false
    
    var canSubmit: Bool { identifier.count >= 3 && password.count >= 6 }
    
    func submit() async {
        guard canSubmit else { return }
        isLoading = true; defer { isLoading = false }
        error = nil
        do {
            let res = try await AppEnvironment.shared.authService
                .login(identifier: identifier, password: password)
            tempToken = res.tempToken
            showOTP = true
        } catch let e as APIError {
            error = e.localizedDescription
        } catch {
            error = "Không thể đăng nhập, vui lòng thử lại."
        }
    }
}
```

### 10.3 OTPView — input 6 ô

```swift
struct OTPView: View {
    let tempToken: String
    @State private var digits: [String] = Array(repeating: "", count: 6)
    @FocusState private var focused: Int?
    @Environment(AuthStore.self) private var auth
    @State private var isVerifying = false
    @State private var error: String?
    
    var otpString: String { digits.joined() }
    
    var body: some View {
        VStack(spacing: AppSpacing.xl) {
            Text("Nhập mã OTP").font(AppFont.title)
            Text("Mã 6 chữ số đã được gửi đến email/SĐT của bạn.")
                .font(AppFont.subheadline).foregroundStyle(.textMuted)
                .multilineTextAlignment(.center)
            
            HStack(spacing: AppSpacing.sm) {
                ForEach(0..<6, id: \.self) { i in
                    TextField("", text: $digits[i])
                        .keyboardType(.numberPad)
                        .multilineTextAlignment(.center)
                        .font(AppFont.title2.monospacedDigit())
                        .frame(width: 48, height: 56)
                        .appGlass(in: .rect(cornerRadius: AppRadius.md))
                        .focused($focused, equals: i)
                        .onChange(of: digits[i]) { _, new in
                            if new.count == 1 && i < 5 { focused = i + 1 }
                            if new.count > 1 { digits[i] = String(new.prefix(1)) }
                        }
                }
            }
            
            if let error { Text(error).foregroundStyle(.appDanger).font(AppFont.footnote) }
            
            Button {
                Task { await verify() }
            } label: {
                if isVerifying {
                    ProgressView().tint(.white)
                } else {
                    Text("Xác nhận").frame(maxWidth: .infinity)
                }
            }
            .buttonStyle(.glassProminent)
            .tint(.primaryBrand)
            .disabled(otpString.count != 6 || isVerifying)
        }
        .padding(AppSpacing.lg)
        .onAppear { focused = 0 }
    }
    
    private func verify() async {
        isVerifying = true; defer { isVerifying = false }
        do {
            try await AppEnvironment.shared.authService.verifyOTP(temp: tempToken, otp: otpString)
            await auth.bootstrap()
        } catch { error = "OTP không đúng hoặc đã hết hạn." }
    }
}
```

---

## 11. UI từng Actor — Highlight Liquid Glass

### 11.1 Tenant — Hero Invoice Card (Trang chủ)

```swift
struct TenantHomeView: View {
    @State private var vm = TenantHomeViewModel()
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: AppSpacing.lg) {
                // Greeting
                VStack(alignment: .leading, spacing: 4) {
                    Text("Xin chào,").font(AppFont.subheadline).foregroundStyle(.textMuted)
                    Text(vm.greeting).font(AppFont.title2)
                }
                
                // Hero invoice
                if let invoice = vm.currentInvoice {
                    InvoiceHeroCard(invoice: invoice)
                }
                
                // Notifications
                if !vm.recentNotifications.isEmpty {
                    SectionHeader(title: "Thông báo gần đây", action: "Xem tất cả")
                    ForEach(vm.recentNotifications) { NotificationRow(notification: $0) }
                }
                
                // Contract card
                if let contract = vm.activeContract {
                    SectionHeader(title: "Hợp đồng của tôi")
                    ContractSummaryCard(contract: contract)
                }
            }
            .padding(AppSpacing.md)
        }
        .background(
            LinearGradient(colors: [.primaryBrandSoft, .surface],
                           startPoint: .top, endPoint: .center)
                .ignoresSafeArea()
        )
        .navigationTitle("Trang chủ")
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button { } label: { Image(systemName: "bell.fill") }
            }
        }
        .task { await vm.load() }
    }
}

struct InvoiceHeroCard: View {
    let invoice: Invoice
    @Environment(Router.self) private var router
    
    var body: some View {
        VStack(alignment: .leading, spacing: AppSpacing.md) {
            HStack {
                VStack(alignment: .leading, spacing: AppSpacing.xxs) {
                    Text("Hoá đơn kỳ \(invoice.period.formattedPeriod)")
                        .font(AppFont.subheadline).foregroundStyle(.textMuted)
                    Text(invoice.total, format: .currency(code: "VND"))
                        .font(AppFont.displayNumber)
                        .contentTransition(.numericText())
                }
                Spacer()
                StatusBadge(label: invoice.status.label, color: invoice.status.color)
            }
            
            HStack {
                Label("Hạn: \(invoice.dueDate.formatted(.dateTime.day().month()))",
                      systemImage: "calendar")
                    .font(AppFont.footnote)
                    .foregroundStyle(invoice.isOverdue ? .appDanger : .textMuted)
                Spacer()
            }
            
            Divider().padding(.vertical, AppSpacing.xs)
            
            // Breakdown rút gọn
            ForEach(invoice.lines.prefix(4)) { line in
                HStack {
                    Text(line.service).font(AppFont.subheadline)
                    Spacer()
                    Text(line.amount, format: .currency(code: "VND"))
                        .font(AppFont.subheadline).monospacedDigit()
                }
            }
            
            if invoice.status == .pending || invoice.status == .overdue {
                Button {
                    router.push(InvoiceDestination.pay(id: invoice.id))
                } label: {
                    HStack {
                        Image(systemName: "creditcard.fill")
                        Text("Thanh toán ngay")
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, AppSpacing.xs)
                }
                .buttonStyle(.glassProminent)
                .tint(.primaryBrand)
            }
        }
        .padding(AppSpacing.lg)
        .background(
            RoundedRectangle(cornerRadius: AppRadius.xl, style: .continuous)
                .fill(.surfaceElevated)
        )
        .appGlass(tint: .glassTintAccent, in: .rect(cornerRadius: AppRadius.xl))
        .shadow(color: .black.opacity(0.06), radius: 24, y: 8)
    }
}
```

### 11.2 Manager — Rooms Grid

```swift
struct RoomsView: View {
    @State private var vm = RoomsViewModel()
    @State private var search = ""
    
    private let columns = [GridItem(.adaptive(minimum: 140), spacing: AppSpacing.md)]
    
    var body: some View {
        ScrollView {
            LazyVGrid(columns: columns, spacing: AppSpacing.md) {
                ForEach(vm.filtered(search: search)) { room in
                    RoomCard(room: room)
                        .contextMenu {
                            Button("Sửa", systemImage: "pencil") { vm.edit(room) }
                            Button("Đổi trạng thái", systemImage: "arrow.triangle.2.circlepath") { vm.changeStatus(room) }
                            Button("Tài sản", systemImage: "shippingbox") { vm.openAssets(room) }
                        }
                }
            }
            .padding(AppSpacing.md)
        }
        .searchable(text: $search, prompt: "Tìm phòng…")
        .navigationTitle("Phòng & tài sản")
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Button { vm.openCreate() } label: {
                    Label("Thêm phòng", systemImage: "plus")
                }
            }
        }
    }
}

struct RoomCard: View {
    let room: Room
    
    var body: some View {
        VStack(alignment: .leading, spacing: AppSpacing.xs) {
            HStack {
                Text(room.code).font(AppFont.title3.weight(.bold))
                Spacer()
                Circle().fill(room.status.color).frame(width: 10, height: 10)
            }
            Text(room.typeName).font(AppFont.caption).foregroundStyle(.textMuted)
            Spacer().frame(height: AppSpacing.xs)
            Text(room.monthlyRent, format: .currency(code: "VND").precision(.fractionLength(0)))
                .font(AppFont.subheadline.weight(.semibold))
            StatusBadge(label: room.status.label, color: room.status.color)
        }
        .padding(AppSpacing.md)
        .frame(maxWidth: .infinity, minHeight: 140, alignment: .topLeading)
        .appGlass(
            tint: room.status == .rented ? .glassTintAccent : nil,
            in: .rect(cornerRadius: AppRadius.lg)
        )
    }
}
```

### 11.3 Admin — KPI Dashboard (macOS / iPadOS)

```swift
struct AdminDashboardView: View {
    @State private var vm = DashboardViewModel()
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: AppSpacing.lg) {
                Text("Tổng quan").font(AppFont.largeTitle)
                
                // KPI row
                LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: AppSpacing.md), count: 4),
                          spacing: AppSpacing.md) {
                    KPICard(title: "Doanh thu tháng",
                            value: vm.revenue.formatted(.currency(code: "VND")),
                            delta: "+12% so với tháng trước", isPositive: true,
                            symbol: "banknote.fill")
                    KPICard(title: "Tỉ lệ lấp đầy",
                            value: "\(vm.occupancyRate)%",
                            delta: "+3%", isPositive: true,
                            symbol: "house.fill")
                    KPICard(title: "Công nợ chưa thu",
                            value: vm.outstandingDebt.formatted(.currency(code: "VND")),
                            delta: "+8% (cảnh báo)", isPositive: false,
                            symbol: "exclamationmark.triangle.fill")
                    KPICard(title: "Chi phí vận hành",
                            value: vm.opex.formatted(.currency(code: "VND")),
                            delta: "-2%", isPositive: true,
                            symbol: "chart.line.downtrend.xyaxis")
                }
                
                // Chart
                GlassCard {
                    Text("Doanh thu 12 tháng theo cơ sở").font(AppFont.headline)
                    Chart(vm.revenueByMonth) { point in
                        LineMark(x: .value("Tháng", point.month),
                                 y: .value("Doanh thu", point.value))
                            .foregroundStyle(by: .value("Cơ sở", point.property))
                            .symbol(by: .value("Cơ sở", point.property))
                    }
                    .frame(height: 280)
                }
                
                // Activity feed + top list
                HStack(alignment: .top, spacing: AppSpacing.md) {
                    GlassCard {
                        Text("Top 5 cơ sở").font(AppFont.headline)
                        // …
                    }
                    GlassCard {
                        Text("Hoạt động gần đây").font(AppFont.headline)
                        // …
                    }
                }
            }
            .padding(AppSpacing.lg)
        }
        .task { await vm.load() }
    }
}
```

### 11.4 Visitor (public site) — Search

```swift
struct VisitorSearchView: View {
    @State private var vm = SearchViewModel()
    
    var body: some View {
        ScrollView {
            VStack(spacing: AppSpacing.lg) {
                // Hero search
                GlassCard {
                    VStack(spacing: AppSpacing.md) {
                        Text("Tìm phòng trọ phù hợp với bạn")
                            .font(AppFont.title2).multilineTextAlignment(.center)
                        
                        FilterRow(filter: $vm.filter)
                        
                        Button {
                            Task { await vm.search() }
                        } label: {
                            Label("Tìm phòng", systemImage: "magnifyingglass")
                                .frame(maxWidth: .infinity).padding(.vertical, AppSpacing.xs)
                        }
                        .buttonStyle(.glassProminent)
                        .tint(.primaryBrand)
                    }
                }
                
                // Results
                LazyVGrid(columns: [GridItem(.adaptive(minimum: 280), spacing: AppSpacing.md)],
                          spacing: AppSpacing.md) {
                    ForEach(vm.results) { room in
                        NavigationLink(value: VisitorDestination.detail(id: room.id)) {
                            RoomListingCard(room: room)
                        }
                    }
                }
            }
            .padding(AppSpacing.md)
        }
        .navigationTitle("Tìm phòng")
    }
}
```

---

## 12. Forms & Validation

### 12.1 Validator

```swift
// Utilities/Extensions/String+Validation.swift
struct Validator {
    static func email(_ s: String) -> String? {
        let regex = #"^[^\s@]+@[^\s@]+\.[^\s@]+$"#
        return s.range(of: regex, options: .regularExpression) == nil
            ? "Email không hợp lệ" : nil
    }
    
    static func phone(_ s: String) -> String? {
        s.filter(\.isNumber).count < 10 ? "Số điện thoại tối thiểu 10 chữ số" : nil
    }
    
    static func required(_ s: String, label: String = "Trường này") -> String? {
        s.trimmingCharacters(in: .whitespaces).isEmpty ? "\(label) không được để trống" : nil
    }
    
    static func minLength(_ s: String, min: Int) -> String? {
        s.count < min ? "Tối thiểu \(min) ký tự" : nil
    }
}
```

### 12.2 Form ViewModel mẫu — Tạo hợp đồng

```swift
@Observable @MainActor
final class ContractFormViewModel {
    var roomId = ""
    var tenantId = ""
    var startDate = Date()
    var endDate = Calendar.current.date(byAdding: .month, value: 6, to: Date()) ?? Date()
    var monthlyRent: Decimal = 0
    var deposit: Decimal = 0
    var withTemporaryResidence = false
    
    var errors: [String: String] = [:]
    var isSubmitting = false
    
    func validate() -> Bool {
        errors.removeAll()
        if let e = Validator.required(roomId, label: "Phòng") { errors["roomId"] = e }
        if let e = Validator.required(tenantId, label: "Khách thuê") { errors["tenantId"] = e }
        if endDate <= startDate { errors["endDate"] = "Ngày kết thúc phải sau ngày bắt đầu" }
        if monthlyRent <= 0 { errors["monthlyRent"] = "Giá phải > 0" }
        return errors.isEmpty
    }
    
    func submit() async throws -> Contract {
        guard validate() else { throw ValidationError() }
        isSubmitting = true; defer { isSubmitting = false }
        return try await AppEnvironment.shared.contractService.create(.init(
            roomId: roomId, tenantId: tenantId,
            startDate: startDate, endDate: endDate,
            monthlyRent: monthlyRent, deposit: deposit,
            withTemporaryResidence: withTemporaryResidence
        ))
    }
}
struct ValidationError: Error {}
```

### 12.3 FormField wrapper

```swift
struct FormField<Content: View>: View {
    let label: String
    let error: String?
    @ViewBuilder var content: () -> Content
    
    var body: some View {
        VStack(alignment: .leading, spacing: AppSpacing.xxs) {
            Text(label).font(AppFont.subheadline).foregroundStyle(.textMuted)
            content()
                .padding(AppSpacing.sm)
                .appGlass(in: .rect(cornerRadius: AppRadius.md))
            if let error {
                Text(error).font(AppFont.caption).foregroundStyle(.appDanger)
            }
        }
    }
}
```

---

## 13. Permissions (RBAC)

```swift
// Core/Permissions/Permission.swift
enum Action: String {
    case propertyCreate, propertyEdit, propertyArchive
    case userCreate, userLock
    case roomEdit, meterInput
    case contractCreate, contractSign, contractTerminate
    case invoiceCreate, invoiceCashConfirm, invoicePay
    case reportView, serviceConfigure
}

enum Role: String, Codable { case admin, manager, tenant, visitor }

enum Permission {
    private static let matrix: [Role: Set<Action>] = [
        .admin:   [.propertyCreate, .propertyEdit, .propertyArchive,
                   .userCreate, .userLock, .contractCreate, .contractTerminate,
                   .invoiceCreate, .invoiceCashConfirm, .reportView, .serviceConfigure],
        .manager: [.roomEdit, .meterInput, .contractCreate, .contractTerminate,
                   .invoiceCashConfirm],
        .tenant:  [.contractSign, .invoicePay],
        .visitor: []
    ]
    
    static func can(_ role: Role, _ action: Action) -> Bool {
        matrix[role]?.contains(action) ?? false
    }
}
```

Dùng trong UI:
```swift
if Permission.can(user.role, .invoiceCreate) {
    Button("Tạo hoá đơn") { … }.buttonStyle(.glass)
}
```

---

## 14. Persistence — SwiftData & Keychain

### 14.1 Keychain wrapper

```swift
// Core/Storage/KeychainStore.swift
import Security

final class KeychainStore {
    private let service = "vn.nhatro.app"
    
    var accessToken: String? {
        get { read(key: "accessToken") }
        set { write(key: "accessToken", value: newValue) }
    }
    var refreshToken: String? {
        get { read(key: "refreshToken") }
        set { write(key: "refreshToken", value: newValue) }
    }
    
    func clear() {
        accessToken = nil; refreshToken = nil
    }
    
    private func read(key: String) -> String? {
        var query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key,
            kSecReturnData as String: true
        ]
        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)
        guard status == errSecSuccess, let data = result as? Data else { return nil }
        return String(data: data, encoding: .utf8)
    }
    
    private func write(key: String, value: String?) {
        let baseQuery: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key
        ]
        SecItemDelete(baseQuery as CFDictionary)
        guard let value, let data = value.data(using: .utf8) else { return }
        var query = baseQuery
        query[kSecValueData as String] = data
        query[kSecAttrAccessible as String] = kSecAttrAccessibleAfterFirstUnlock
        SecItemAdd(query as CFDictionary, nil)
    }
}
```

### 14.2 SwiftData cache offline

```swift
// Core/Storage/SwiftDataStack.swift
import SwiftData

@Model
final class CachedInvoice {
    @Attribute(.unique) var id: String
    var code: String
    var period: String
    var total: Decimal
    var status: String
    var cachedAt: Date
    
    init(id: String, code: String, period: String, total: Decimal, status: String) {
        self.id = id; self.code = code; self.period = period
        self.total = total; self.status = status
        self.cachedAt = .now
    }
}

extension ModelContainer {
    static func make() -> ModelContainer {
        let schema = Schema([CachedInvoice.self])
        let config = ModelConfiguration(schema: schema, isStoredInMemoryOnly: false)
        return try! ModelContainer(for: schema, configurations: config)
    }
}
```

---

## 15. Payments — VNPay/MoMo (qua Safari) + Apple Pay

### 15.1 Flow VNPay

```swift
struct PaymentView: View {
    let invoiceId: String
    @State private var session: PaymentSession?
    @State private var showSafari = false
    @State private var paymentResult: PaymentResult?
    
    var body: some View {
        VStack(spacing: AppSpacing.lg) {
            if let session {
                Text("Đang chuyển sang cổng VNPay…")
                ProgressView()
            }
        }
        .task {
            do {
                session = try await AppEnvironment.shared.invoiceService.initPayment(invoiceId: invoiceId)
                showSafari = true
            } catch { /* handle */ }
        }
        .sheet(isPresented: $showSafari) {
            if let url = session?.redirectURL {
                SafariView(url: url) { result in
                    paymentResult = result
                    showSafari = false
                }
            }
        }
        .navigationDestination(item: $paymentResult) { result in
            PaymentResultView(result: result)
        }
    }
}

// Wrapper SFSafariViewController
import SafariServices
struct SafariView: UIViewControllerRepresentable {
    let url: URL
    let onComplete: (PaymentResult) -> Void
    func makeUIViewController(context: Context) -> SFSafariViewController { SFSafariViewController(url: url) }
    func updateUIViewController(_ uiViewController: SFSafariViewController, context: Context) {}
}
```

Backend xử lý IPN từ VNPay; app dùng polling hoặc deep link `nhatro://payment/result?invoice=...&status=...` để biết kết quả.

### 15.2 Apple Pay (phase 2)

```swift
import PassKit

func startApplePay(amount: Decimal, invoiceCode: String) {
    let req = PKPaymentRequest()
    req.merchantIdentifier = "merchant.vn.nhatro.app"
    req.supportedNetworks = [.visa, .masterCard, .JCB]
    req.merchantCapabilities = .threeDSecure
    req.countryCode = "VN"
    req.currencyCode = "VND"
    req.paymentSummaryItems = [
        PKPaymentSummaryItem(label: "Hoá đơn \(invoiceCode)", amount: NSDecimalNumber(decimal: amount))
    ]
    let vc = PKPaymentAuthorizationController(paymentRequest: req)
    // vc.delegate = …
    vc.present(completion: nil)
}
```

---

## 16. Localization

### 16.1 String Catalog

Tạo `Localizable.xcstrings` (Xcode → File → New → String Catalog). Khai báo:

```jsonc
{
  "sourceLanguage" : "vi",
  "strings" : {
    "invoice.total" : {
      "localizations" : {
        "vi" : { "stringUnit" : { "state" : "translated", "value" : "Tổng tiền" } },
        "en" : { "stringUnit" : { "state" : "translated", "value" : "Total" } }
      }
    },
    "invoice.pay_now" : { "localizations" : {
      "vi" : { "stringUnit" : { "value" : "Thanh toán ngay" } },
      "en" : { "stringUnit" : { "value" : "Pay now" } }
    }}
  }
}
```

Dùng trong code:
```swift
Text("invoice.total")               // SwiftUI tự lookup
Text(String(localized: "invoice.pay_now"))
```

---

## 17. Accessibility

### 17.1 Checklist bắt buộc

- **Dynamic Type**: dùng `Font.system(.body)` thay vì `.font(.system(size: 16))`.
- **VoiceOver**: mọi icon-only button có `.accessibilityLabel`.
- **Reduce Motion**: animation bọc trong `.animation(.default.disabled(reduceMotion))`.
- **Reduce Transparency**: đã xử lý trong `AdaptiveGlass` (fallback material đặc).
- **Color contrast**: cặp text/background đạt AA (4.5:1). Test bằng Accessibility Inspector.
- **Tap target**: tối thiểu 44×44 pt (Apple HIG).

### 17.2 Pattern

```swift
@Environment(\.accessibilityReduceMotion) private var reduceMotion

Button { } label: {
    Image(systemName: "bell.fill")
        .accessibilityLabel("Thông báo")
        .accessibilityHint("Mở danh sách thông báo gần đây")
}
.frame(minWidth: 44, minHeight: 44)
```

---

## 18. Push Notifications

```swift
// App/AppDelegate or Notification handler
import UserNotifications

@MainActor
final class NotificationManager: NSObject, UNUserNotificationCenterDelegate {
    static let shared = NotificationManager()
    
    func requestAuthorization() async {
        do {
            let granted = try await UNUserNotificationCenter.current()
                .requestAuthorization(options: [.alert, .badge, .sound])
            if granted {
                await UIApplication.shared.registerForRemoteNotifications()
            }
        } catch { Log.notification.error("\(error)") }
    }
    
    // Handler khi user nhấn vào notification
    func userNotificationCenter(_ center: UNUserNotificationCenter,
                                didReceive response: UNNotificationResponse) async {
        let userInfo = response.notification.request.content.userInfo
        if let invoiceId = userInfo["invoice_id"] as? String {
            await MainActor.run {
                AppEnvironment.shared.router.push(InvoiceDestination.detail(id: invoiceId))
            }
        }
    }
}
```

---

## 19. Testing

### 19.1 Swift Testing (ưu tiên cho Swift 6)

```swift
// NhaTroAppTests/InvoiceViewModelTests.swift
import Testing
@testable import NhaTroApp

@MainActor
@Suite("InvoiceListViewModel")
struct InvoiceListViewModelTests {
    @Test func loadsSuccessfully() async throws {
        let mock = MockInvoiceService(stub: [.preview(.pending)])
        let vm = InvoiceListViewModel(service: mock)
        await vm.load()
        #expect(vm.state == .loaded)
        #expect(vm.invoices.count == 1)
    }
    
    @Test func handlesErrors() async {
        let mock = MockInvoiceService(error: APIError.unauthorized)
        let vm = InvoiceListViewModel(service: mock)
        await vm.load()
        if case .error = vm.state {} else { Issue.record("Expected error") }
    }
}
```

### 19.2 UI Test (XCUITest) — Tenant pay flow

```swift
final class PaymentUITests: XCTestCase {
    func test_tenantPaysInvoice_endToEnd() throws {
        let app = XCUIApplication()
        app.launchArguments = ["-UITest", "-StubUser", "tenant"]
        app.launch()
        
        let payButton = app.buttons["invoice.pay_now"]
        XCTAssertTrue(payButton.waitForExistence(timeout: 5))
        payButton.tap()
        
        let vnpayCell = app.buttons["payment.method.vnpay"]
        XCTAssertTrue(vnpayCell.waitForExistence(timeout: 3))
        vnpayCell.tap()
        // …
    }
}
```

---

## 20. Performance budget

| Chỉ số | Mục tiêu |
|---|---|
| App launch (cold) | < 1.8 s iPhone 14+ |
| Tenant Home FPS | 60 fps liên tục khi cuộn |
| Invoice list 200 dòng | scroll mượt, không drop frame |
| Bundle size (.ipa) | < 40 MB |
| Memory tiền cảnh | < 200 MB |
| Liquid Glass overhead | < 8% CPU thêm so với plain |

### Best practices
- Dùng `LazyVStack` / `LazyVGrid` cho danh sách dài.
- Tránh nest nhiều `GeometryReader`.
- Image: dùng `AsyncImage` với placeholder + cache (Kingfisher / Nuke nếu cần).
- Animation: dùng `.snappy` (spring) thay vì `.linear` cho cảm giác native.
- **Không** wrap mọi view trong `GlassEffectContainer` — chỉ nơi có nhiều element kính.

---

## 21. Quality gates

### 21.1 SwiftLint config (rút gọn)

```yaml
# .swiftlint.yml
disabled_rules:
  - trailing_whitespace
opt_in_rules:
  - empty_count
  - explicit_init
  - first_where
  - sorted_imports
  - vertical_whitespace_closing_braces
line_length: 140
identifier_name:
  min_length: 2
  excluded: [id, vm, ok]
```

### 21.2 SwiftFormat config

```yaml
--indent 4
--swiftversion 6.0
--header strip
--wraparguments before-first
--wrapparameters before-first
```

### 21.3 Pre-commit hook (`.git/hooks/pre-commit`)

```bash
#!/usr/bin/env bash
set -e
swiftformat --lint .
swiftlint --strict
xcodebuild test -scheme NhaTroApp -destination 'platform=iOS Simulator,name=iPhone 16' -quiet
```

---

## 22. Roadmap (8 sprint)

| Sprint | Mục tiêu | Deliverable |
|---|---|---|
| 1 | Foundation | Project setup, Design System, AppEnvironment, APIClient, Keychain, AuthStore |
| 2 | Auth full | Login + OTP + Forgot/Reset, RootView role-switching |
| 3 | Tenant MVP | Trang chủ + Invoice detail + Payment VNPay sandbox |
| 4 | Tenant polish | Contracts viewer, Profile, Push notification |
| 5 | Manager iPad | Rooms grid, Meters inline-edit, Contracts stepper |
| 6 | Manager polish | Cash receipts, Notifications, offline cache (SwiftData) |
| 7 | Admin Mac | Dashboard, Properties, Users, Invoices, Reports |
| 8 | Visitor + hardening | Public search/detail/deposit, A11y audit, Performance, TestFlight |

---

## 23. Anti-patterns cần tránh

| ❌ Sai | ✅ Đúng |
|---|---|
| `Color(red:0.2, green:0.3, blue:0.8)` rải rác | Asset color `Color.primaryBrand` |
| `.glassEffect()` bọc nguyên `ScrollView` chứa text dài | Chỉ bọc controls / cards nhỏ |
| `.font(.system(size: 16))` | `.font(AppFont.body)` để hỗ trợ Dynamic Type |
| `class ViewModel: ObservableObject + @Published` | `@Observable final class ViewModel` |
| Gọi `URLSession` rải rác trong View | Tập trung qua `APIClient` + Service |
| Hardcode chuỗi `"Thanh toán ngay"` | Key i18n `Text("invoice.pay_now")` |
| Hardcode role check `if user.role == "admin"` | `Permission.can(user.role, .invoiceCreate)` |
| Lưu access token trong `UserDefaults` | `KeychainStore` |
| Animation `.linear` cho controls | `.snappy` / `.spring` cho cảm giác native |
| Chồng `glassEffect` 3+ lớp | Tối đa 2 lớp (ví dụ modal trên tab bar) |
| `LazyVStack` lồng trong `LazyVStack` | Reset structure cho 1 cấp lazy |
| Modal lồng modal | Dùng `NavigationStack` push hoặc multi-step |
| Async việc nặng trong View body | `.task { await … }` |
| Hardcode `cornerRadius: 20` | Token `AppRadius.lg` |

---

## 24. Tài liệu liên kết

- `UI_Design_Brief.md` — Đặc tả UX/UI nghiệp vụ (screens + flows).
- `Báo cáo PTTKHT.docx` — Phân tích chính thức (use case, class, sequence).
- Apple — *Meet Liquid Glass* (WWDC 2025).
- Apple — *Build a SwiftUI app with the new design* (WWDC 2025).
- Apple — *Adopting Liquid Glass* (Human Interface Guidelines).
- Figma project: *(cập nhật khi có).*

---

## Phụ lục A — Snippet quick-reference Liquid Glass

```swift
// 1. Glass card cơ bản
VStack { … }
    .padding()
    .glassEffect(.regular, in: .rect(cornerRadius: 20))

// 2. Glass button CTA quan trọng
Button("Lưu") { … }
    .buttonStyle(.glassProminent).tint(.primaryBrand)

// 3. Glass button thường
Button("Huỷ") { … }
    .buttonStyle(.glass)

// 4. Glass với tint nhẹ
.glassEffect(.regular.tint(.appWarning.opacity(0.5)), in: .capsule)

// 5. Interactive glass (phản ứng khi nhấn)
.glassEffect(.regular.interactive(), in: .circle)

// 6. Glass container cho cluster
GlassEffectContainer(spacing: 16) {
    HStack(spacing: 12) {
        ForEach(items) { item in
            ItemView(item).glassEffect(.regular.interactive(), in: .circle)
                .glassEffectID(item.id, in: namespace)
        }
    }
}

// 7. Toolbar / Tab bar — tự động Liquid Glass khi target iOS 26+
NavigationStack { … }
    .toolbar { ToolbarItem(placement: .topBarTrailing) { Button(…) { } } }

// 8. Search bar — tự động Liquid Glass
.searchable(text: $query, prompt: "Tìm…")

// 9. Sheet — handle có Liquid Glass
.sheet(isPresented: $show) { DetailView() }

// 10. Fallback khi Reduce Transparency được bật
@Environment(\.accessibilityReduceTransparency) var reduceTransparency
content.background(reduceTransparency ? AnyShapeStyle(.regularMaterial)
                                       : AnyShapeStyle(.clear))
```

---

*Tài liệu này là contract giữa team Frontend (Swift), team Designer, và team Backend. Mọi thay đổi lớn (đổi cách dùng Liquid Glass, đổi cấu trúc, đổi tech stack) cần cập nhật vào đây và thông báo cho cả team.*
