# متجري — نظام كاشير POS

تطبيق ويب عربي متجاوب للهاتف والحاسوب، يعمل مباشرة دون خطوة بناء.

- نقطة بيع نقدية وآجلة مرتبطة بالمخزون.
- إدارة المنتجات والتصنيفات والزبائن والديون.
- تقارير زمنية، أرباح الأصناف، الإيصالات وإلغاء الفواتير.
- إعدادات المتجر والعملة، نسخ JSON احتياطية وتصدير CSV.

البيانات محفوظة في LocalStorage داخل المتصفح والجهاز الحالي. تُستخدم بيانات تجريبية عند الفتح لأول مرة، ويمكن تصفيرها من الإعدادات. تغيير رابط الموقع لا ينقل بيانات المتصفح؛ استخدم التصدير والاستعادة لنقلها.

## التشغيل المحلي

`python -m http.server 5182 --bind 127.0.0.1`

## التحقق

`node tests/inventory.cjs`

`node tests/ledger.cjs`

`node tests/reports-backup.cjs`

`node tests/persistence.cjs`

GitHub Pages ينشر فرع `main` من جذر المستودع. الخط Cairo والأيقونات Lucide تُحمّل عبر CDN. الطباعة تستخدم نافذة المتصفح.

## صور المواد الغذائية التجريبية

الكتالوج التجريبي الجديد يحتوي على عشرة منتجات غذائية مصوّرة. تحديث الكتالوج القديم يضيف صور المنتجات التجريبية والخمسة أصناف الجديدة فقط، ويحافظ على الأسعار والكميات والصور المرفوعة يدوياً. الكتالوجات التي خرجت من وضع التجربة لا تُملأ تلقائياً.

تفاصيل الصور: [IMAGE_SOURCES.md](IMAGE_SOURCES.md).

`node tests/grocery-catalog.cjs`

Partial returns preserve the original invoice and append a `sale_return` audit entry with original unit prices/costs and line indices. The return restores selected stock only; customer balances and net receipts include returns. Previously paid credit may become a customer credit balance. Cancellation restores only the remaining invoice quantities. Reports recognize sales on the sale date and deduct returns/cancellations on their own event dates (Baghdad timezone); older invoice cancellation entries remain supported. Run `node tests/partial-returns.cjs` for returns and reconciliation checks.
