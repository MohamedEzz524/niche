(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
// page-specific lookups: a detached stand-in when the element isn't on this page, so shared code is safe on every template
const NULL_EL = document.createElement('div');
const $p = (s, r = document) => r.querySelector(s) || NULL_EL;
const onPage = s => !!document.querySelector(s);
const store = {
  get(k, d) { try { const v = localStorage.getItem('folio:' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem('folio:' + k, JSON.stringify(v)); } catch {} }
};
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));

/* =====================================================================
   PRELOADER — fades out once the page has loaded (min. display so the smoke is seen)
   ===================================================================== */
(() => {
  const pl = document.getElementById('preloader');
  if (!pl) return;
  if (pl.hidden) return pl.remove(); // switched off: drop it (also stops the smoke loop)
  // progress bar at the bottom: share of above-the-fold images loaded, 100% when the page is ready
  const fill = pl.querySelector('.pl__fill');
  let shown = 0, gone = false;
  const paint = v => { shown = Math.max(shown, Math.min(100, v)); if (fill) fill.style.width = shown + '%'; pl.setAttribute('aria-valuenow', Math.round(shown)); };
  const track = () => {
    if (gone) return;
    const imgs = [...document.images].filter(i => !pl.contains(i) && (i.loading !== 'lazy' || i.getBoundingClientRect().top < innerHeight * 1.5));
    paint(8 + (imgs.length ? imgs.filter(i => i.complete).length / imgs.length : 1) * 82);
    requestAnimationFrame(track);
  };
  paint(8); requestAnimationFrame(track);
  const hide = () => {
    if (gone) return;
    gone = true; paint(100);
    setTimeout(() => {
      pl.classList.add('is-done');
      setTimeout(() => pl.remove(), 900);
    }, Math.max(350, 1800 - performance.now()));   // short minimum so the logo animation still registers
  };
  if (document.readyState === 'complete') hide();
  else addEventListener('load', hide, {once: true});
  setTimeout(hide, 9000);
})();

/* =====================================================================
   I18N — Arabic (default, RTL) + English
   ===================================================================== */
const I18N = {
en: {
  'meta.title': 'Honey Orchard – Eau de Parfum | Niche', 'skip': 'Skip to content',
  'ann.1': 'Up to&nbsp;<b>20% OFF</b>&nbsp;+ FREE shipping', 'ann.2': 'Free returns on&nbsp;<b>every</b>&nbsp;order', 'ann.3': 'Bundle 3 scents &amp; save&nbsp;<b>extra 10%</b>',
  'a.offer': 'Offer details', 'a.main': 'Main', 'a.cart': 'Cart', 'a.locale': 'Country and language', 'a.menu': 'Menu', 'a.crumbs': 'Breadcrumb', 'a.closeMenu': 'Close menu', 'a.clear': 'Clear', 'a.closeSearch': 'Close search', 'a.cookie': 'Cookie settings', 'a.dec': 'Decrease', 'a.inc': 'Increase', 'a.openImg': 'Open image {n}',
  'nav.perfumes': 'Perfumes', 'nav.bundle': 'Make a bundle', 'nav.about': 'About', 'nav.search': 'Search',
  'mega.all': 'Shop All Perfumes', 'mega.imp': 'Impressions', 'mega.orig': 'Originals', 'mega.back': 'Back', 'mega.origAll': 'Shop All Originals',
  'coll.1': 'The Orchard Edit', 'coll.2': 'Vanilla Studies', 'coll.3': 'Night Garden', 'coll.4': 'Layering Duos',
  'mega.gender': 'Shop by Gender', 'g.Women': 'Women', 'g.Men': 'Men', 'g.Unisex': 'Unisex',
  'mega.edits': 'The Edits', 'edit.best': 'Bestsellers', 'edit.new': 'New Arrivals', 'mega.discover': 'Discover', 'disc.layer': 'Layering Perfumes', 'disc.fams': 'Scent Families',
  'fam.Flowery': 'Flowery', 'fam.Fresh': 'Fresh', 'fam.Gourmand': 'Gourmand', 'fam.Herbal': 'Herbal', 'fam.Earthy': 'Earthy', 'fam.Warm': 'Warm',
  'about.who': 'Who we are', 'about.us': 'About Us', 'about.refer': 'Refer A Friend', 'about.help': 'Help', 'about.contact': 'Contact Us', 'about.faq': 'FAQ',
  'crumb.back': 'Back', 'crumb.all': 'All', 'crumb.imp': 'Niche Impressions',
  'p.name': 'Honey Orchard', 'p.meta': 'Eau de Parfum. Size: 50ml / 1.7oz',
  'p.inspired': 'Smells like these fragrances <a href="#" data-toast-k="toast.compare">on Google</a><br>(Inspired by {p})',
  'p.crafted': 'Crafted in&nbsp;<span class="coral" style="font-weight:600">France</span>', 'p.family': '<b>Scent Family:</b> Gourmand',
  'p.famTip': '<b>Gourmand</b> scents smell good enough to eat: honey, caramel, vanilla, ripe fruit and toasted nuts. Cosy, sweet and easy to love.',
  'p.atc': 'Add to cart', 'p.added': 'Added ✓', 'edp': 'Eau de Parfum · 50ml',
  'acc.notes': 'Scent Notes', 'notes.is': '<b>This perfume is:</b> Biting into a sun-warm apricot', 'notes.main': 'Main Notes:',
  'note.pear': 'Pear', 'note.bergamot': 'Bergamot', 'note.honey': 'Honey', 'note.apricot': 'Apricot', 'note.peach': 'Peach Skin', 'note.vetiver': 'Vetiver',
  'pyr.top': '<b>Top:</b> The first notes you smell<br>Pear, Bergamot', 'pyr.mid': '<b>Middle:</b> The heart of the perfume<br>Honey, Apricot', 'pyr.base': '<b>Base:</b> The notes that linger all day<br>Peach Skin, Vetiver',
  'notes.ing': '<b>Ingredients:</b> Alcohol Denat., Parfum (Fragrance), Aqua (Water), Limonene, Linalool, Coumarin, Hexyl Cinnamal, Citral, Benzyl Salicylate, Geraniol.',
  'tag.vegan': 'Vegan', 'tag.cf': 'Cruelty-free', 'tag.clean': 'Clean ingredients',
  'acc.about': 'About', 'about.p1': 'Honey Orchard opens bright and crisp with pear and bergamot, then settles into a golden heart of wildflower honey and ripe apricot. A soft trail of peach skin and vetiver keeps it grounded, so it reads sunny rather than sugary.', 'about.p2': 'Bright, golden and easy to wear, it is a feel-good scent for every day.',
  'acc.ship': 'Shipping + Returns', 'acc.shipSub': 'Free shipping with 2+ items. Free returns.', 'ship.p': 'Orders ship within 1–2 business days. Standard delivery takes 2–5 business days. Not in love? Return any bottle within 30 days, even if it’s been opened.',
  'acc.faq': 'FAQs', 'faq.q1': 'How long does it last?', 'faq.a1': 'Most customers get 6–8 hours. Spray on pulse points and moisturised skin for the best wear.', 'faq.q2': 'Is it a sample size?', 'faq.a2': 'No, every bottle is a full 50ml eau de parfum.', 'faq.q3': 'Can I layer it?', 'faq.a3': 'Yes. Try it with a vanilla or woody scent for a warmer, deeper trail.',
  'acc.paired': 'Best paired with:', 'paired.note': 'Layer for a warmer, toasted finish.', 'btn.addPrice': 'Add – {p}',
  'trust.1': 'Free<br>returns', 'trust.1s': 'guaranteed', 'trust.2': 'Made<br>in France', 'trust.3': '2M+ bottles<br>sold', 'trust.4': 'Long-<br>lasting', 'trust.4s': 'eau de parfum',
  'recs.title': 'You Might Love', 'recs.more': 'Show more', 'recs.all': 'All perfumes shown',
  'card.alt': 'Smells like these<br>Fragrances', 'card.lux': 'Inspired by {p}', 'insp.by': 'Inspired by:', 'insp.Men': 'For him', 'insp.Women': 'For her', 'insp.Unisex': 'Unisex', 'card.orig': 'Niche Originals',
  'rated.brand': 'Reviewed', 'rated.txt': 'Niche is rated <b>Excellent</b>.', 'rated.small': '4.8 ⓘ (1000+ Reviews)',
  'rv.tab': 'Reviews ({n})', 'qa.tab': 'Questions', 'rv.based': 'Based on {n} reviews', 'rv.rating': 'Rating', 'rv.write': 'Write a review', 'rv.sort': 'Sort',
  'sort.recent': 'Most Recent', 'sort.high': 'Highest Rating', 'sort.low': 'Lowest Rating', 'sort.helpful': 'Most Helpful',
  'rv.more': 'Show more', 'rv.verified': 'Verified Buyer', 'rv.rec': 'I recommend this product', 'rv.helpful': 'Was this helpful?', 'rv.brand': 'Niche Team', 'rv.empty': 'No {n}-star reviews yet.', 'rv.justnow': 'Just now', 'rv.starsAl': '{n} star reviews',
  'qa.intro': 'Have a question? Our team usually answers within a day.', 'qa.ask': 'Ask a question', 'qa.q': 'Q:', 'qa.wait': 'Awaiting answer',
  'seo': 'Vanilla Perfume|Jasmine Perfume|Oud Perfume|Patchouli Perfume|Rose Perfume|Lavender Perfume|Coconut Perfume|Gardenia Perfume|Amber Perfume|Musk Perfume',
  'f.news': 'Be the first to know.', 'f.email': 'Enter your email address', 'f.submit': 'Submit', 'f.nlBad': 'Please enter a valid email address.', 'f.nlOk': 'Thanks for subscribing! Check your inbox ✉️',
  'f.vegan': 'VEGAN<br>&amp; CRUELTY-FREE', 'f.countries': 'Shop the following countries.', 'f.discover': 'Discover.', 'f.d1': 'Scent Family', 'f.d2': 'Layering', 'f.d3': 'Shop by theme', 'f.d5': 'Scent Finder Quiz',
  'f.help': 'Help.', 'f.h2': 'Returns', 'f.h4': 'Testimonials', 'f.h5': 'Accessibility', 'f.h6': 'Withdraw from contract', 'f.h7': 'Customer data requests',
  'legal.privacy': 'Privacy Policy', 'legal.terms': 'Terms &amp; Conditions', 'legal.cookies': 'Cookies declaration', 'legal.rights': '© {y} All Rights Reserved',
  'sticky.btn': 'Add to cart · {p}',
  'cart.n1': '1 item', 'cart.n2': '2 items', 'cart.nn': '{n} items', 'cart.oops': 'Oops…', 'cart.empty': 'You have no items in your bag.<br>Let us help!', 'cart.like': 'You might <b>like to add</b>', 'cart.shopAll': 'Shop all perfumes', 'cart.ship': 'Free shipping on 2+ items',
  'cart.max': '🎉 You unlocked the <b>maximum 20% OFF</b> + free shipping!', 'cart.next': 'Add <b>{n} more</b> to unlock <b>{d}% OFF</b>{ship}', 'cart.nextShip': ' + free shipping', 'cart.complete': 'Complete the <b>bundle</b>',
  'cart.disc': 'Bundle discount ({d}%)', 'cart.sub': 'Subtotal', 'cart.shipFree': 'Free shipping applied.', 'cart.shipCalc': 'Shipping calculated at checkout.', 'cart.tax': 'Taxes included.', 'cart.checkout': 'Checkout', 'cart.rm': 'Remove',
  'toast.demo': 'This is a demo template — checkout is not connected.', 'toast.compare': 'Opens a comparison search in a new tab',
  'search.popular': 'Popular Searches', 'search.products': 'Products', 'search.none': 'No matches for “{q}”. Try a note like vanilla, pear or rose.', 'search.showing': 'Showing perfumes for “{q}”',
  'search.terms': 'vanilla|smoked vanilla|vanilla studies|honey|honey orchard|pear|white pear|almond|velvet almond|cherry|black cherry|rose|rose tea|tea|matcha|citrus|citrus matcha|saffron|saffron dusk|caramel|salted caramel|marshmallow|cloud marshmallow|fig|golden fig|sea salt musk|musk|cedar|cedar smoke|smoke|apricot|peach|bergamot|vetiver|gourmand|fresh|warm|flowery|earthy',
  'mm.coll': 'Shop Collections', 'mm.sale': 'Sample Sale', 'mm.insta': 'Instagram', 'mm.tiktok': 'TikTok', 'mm.loc': 'Country / Language',
  'loc.title': 'Country &amp; language', 'loc.country': 'Country/region', 'loc.search': 'Search countries', 'loc.lang': 'Language', 'loc.update': 'Update', 'loc.none': 'No country found', 'toast.loc': 'Shopping in {c} · {l}',
  'cookie.title': 'We respect your privacy', 'cookie.text': 'This website uses cookies to ensure you get the best experience. <a href="#" class="u-link">Learn more</a>', 'cookie.accept': 'Accept', 'cookie.decline': 'Decline', 'cookie.prefs': 'Preferences',
  'cookie.nec': 'Necessary<small>Required for the site to work</small>', 'cookie.ana': 'Analytics<small>Helps us improve the store</small>', 'cookie.mkt': 'Marketing<small>Personalised offers</small>', 'cookie.save': 'Save preferences',
  'lead.capT': 'Women’s bestsellers', 'lead.cap': 'Miss, Scandal & Coco Niche', 'lead.close': 'Close', 'lead.hi': 'Hey, first-timer!', 'lead.h': 'Want up to <span class="coral">20% OFF?</span>', 'lead.p': 'Join our VIP email list for exclusive access.', 'lead.ph': 'Enter your email here',
  'lead.fine': 'By tapping “Next” you agree to receive marketing emails. You can unsubscribe at any time. See our Privacy Policy and Terms of Service.', 'lead.next': 'Next', 'lead.no': 'No thanks.',
  'lead.in': 'You’re in!', 'lead.h2': 'Here’s <span class="coral">20% OFF</span>', 'lead.p2': 'Use this code at checkout on your first order.', 'lead.copy': 'Copy', 'lead.start': 'Start shopping', 'lead.pill': 'Get 20% OFF', 'toast.copied': 'Code copied!', 'toast.code': 'Code: {c}',
  'offer.title': 'Bundle &amp; save', 'offer.2': '2 perfumes', 'offer.3': '3 perfumes', 'offer.4': '4+ perfumes', 'offer.off': '{d}% OFF', 'offer.note': 'Discount applies automatically in your cart. Free shipping on orders with 2 or more items.',
  'rf.review': 'Write a review', 'rf.question': 'Ask a question', 'rf.sub': 'Honey Orchard · Eau de Parfum', 'rf.rating': 'Your rating', 'rf.name': 'Name', 'rf.head': 'Title', 'rf.body': 'Review', 'rf.q': 'Question', 'rf.submit': 'Submit', 'rf.defTitle': 'My review', 'rf.starsAl': '{n} stars',
  'toast.needRating': 'Please choose a star rating', 'toast.needFields': 'Please fill in your name and message', 'toast.rvAdded': 'Thanks! Your review was added.', 'toast.qAdded': 'Thanks! We’ll answer soon.',
  'pip.hi': 'Hi, I’m Pip!', 'pip.pick': 'Pick a cursor flavour while you browse:', 'pip.hide': 'Hide Pip', 'pip.open': 'Open Pip', 'toast.nap': 'Pip is taking a nap 💤', 'toast.cursor': 'Cursor: {f}',
  'flv.honey': 'Honey Drip', 'flv.berry': 'Berry Pop', 'flv.marsh': 'Marshmallow',
},
ar: {
  'meta.title': 'بستان العسل – ماء عطر | نيش', 'skip': 'انتقل إلى المحتوى',
  'ann.1': 'خصم حتى&nbsp;<b>20%</b>&nbsp;+ شحن مجاني', 'ann.2': 'إرجاع مجاني على&nbsp;<b>كل</b>&nbsp;طلب', 'ann.3': 'اجمع 3 عطور ووفّر&nbsp;<b>10% إضافية</b>',
  'a.offer': 'تفاصيل العرض', 'a.main': 'القائمة الرئيسية', 'a.cart': 'السلة', 'a.locale': 'الدولة واللغة', 'a.menu': 'القائمة', 'a.crumbs': 'مسار التنقل', 'a.closeMenu': 'إغلاق القائمة', 'a.clear': 'مسح', 'a.closeSearch': 'إغلاق البحث', 'a.cookie': 'إعدادات ملفات الارتباط', 'a.dec': 'إنقاص', 'a.inc': 'زيادة', 'a.openImg': 'افتح الصورة {n}',
  'nav.perfumes': 'العطور', 'nav.bundle': 'كوّن باقتك', 'nav.about': 'من نحن', 'nav.search': 'بحث',
  'mega.all': 'تسوّق كل العطور', 'mega.imp': 'الانطباعات', 'mega.orig': 'الأصلية', 'mega.back': 'رجوع', 'mega.origAll': 'كل العطور الأصلية',
  'coll.1': 'مجموعة البستان', 'coll.2': 'دراسات الفانيليا', 'coll.3': 'حديقة الليل', 'coll.4': 'ثنائيات الطبقات',
  'mega.gender': 'تسوّق حسب الفئة', 'g.Women': 'نساء', 'g.Men': 'رجال', 'g.Unisex': 'للجنسين',
  'mega.edits': 'المختارات', 'edit.best': 'الأكثر مبيعاً', 'edit.new': 'وصل حديثاً', 'mega.discover': 'اكتشف', 'disc.layer': 'طبقات العطور', 'disc.fams': 'العائلات العطرية',
  'fam.Flowery': 'زهري', 'fam.Fresh': 'منعش', 'fam.Gourmand': 'غورماند', 'fam.Herbal': 'عشبي', 'fam.Earthy': 'ترابي', 'fam.Warm': 'دافئ',
  'about.who': 'من نحن', 'about.us': 'قصتنا', 'about.refer': 'ادعُ صديقاً', 'about.help': 'المساعدة', 'about.contact': 'تواصل معنا', 'about.faq': 'الأسئلة الشائعة',
  'crumb.back': 'رجوع', 'crumb.all': 'الكل', 'crumb.imp': 'انطباعات نيش',
  'p.name': 'بستان العسل', 'p.meta': 'ماء عطر. الحجم: 50 مل / 1.7 أونصة',
  'p.inspired': 'يشبه هذه العطور <a href="#" data-toast-k="toast.compare">على Google</a><br>(مستوحى من {p})',
  'p.crafted': 'صُنع في&nbsp;<span class="coral" style="font-weight:600">فرنسا</span>', 'p.family': '<b>العائلة العطرية:</b> غورماند',
  'p.famTip': 'عطور <b>الغورماند</b> شهيّة الرائحة: عسل وكراميل وفانيليا وفواكه ناضجة ومكسّرات محمّصة. دافئة وحلوة وسهلة الحب.',
  'p.atc': 'أضف إلى السلة', 'p.added': 'تمت الإضافة ✓', 'edp': 'ماء عطر · 50 مل',
  'acc.notes': 'النوتات العطرية', 'notes.is': '<b>هذا العطر هو:</b> قضمة من مشمشة دافئة تحت الشمس', 'notes.main': 'النوتات الرئيسية:',
  'note.pear': 'إجاص', 'note.bergamot': 'برغموت', 'note.honey': 'عسل', 'note.apricot': 'مشمش', 'note.peach': 'قشر الخوخ', 'note.vetiver': 'نجيل الهند',
  'pyr.top': '<b>القمة:</b> أول ما تشمّه<br>إجاص، برغموت', 'pyr.mid': '<b>القلب:</b> جوهر العطر<br>عسل، مشمش', 'pyr.base': '<b>القاعدة:</b> ما يبقى طوال اليوم<br>قشر الخوخ، نجيل الهند',
  'notes.ing': '<b>المكوّنات:</b> <span dir="ltr">Alcohol Denat., Parfum (Fragrance), Aqua (Water), Limonene, Linalool, Coumarin, Hexyl Cinnamal, Citral, Benzyl Salicylate, Geraniol.</span>',
  'tag.vegan': 'نباتي', 'tag.cf': 'خالٍ من القسوة', 'tag.clean': 'مكوّنات نظيفة',
  'acc.about': 'عن العطر', 'about.p1': 'يفتتح بستان العسل بانتعاش الإجاص والبرغموت، ثم يستقر في قلب ذهبي من عسل الزهور البرية والمشمش الناضج. ويمنحه أثر ناعم من قشر الخوخ ونجيل الهند توازناً، فيبدو مشمساً لا سكّرياً.', 'about.p2': 'مشرق وذهبي وسهل الارتداء، عطر يبعث على البهجة كل يوم.',
  'acc.ship': 'الشحن والإرجاع', 'acc.shipSub': 'شحن مجاني عند طلب قطعتين أو أكثر. إرجاع مجاني.', 'ship.p': 'نشحن الطلبات خلال يوم إلى يومي عمل، ويستغرق التوصيل القياسي من 2 إلى 5 أيام عمل. لم يعجبك العطر؟ أعد أي زجاجة خلال 30 يوماً حتى لو كانت مفتوحة.',
  'acc.faq': 'الأسئلة الشائعة', 'faq.q1': 'كم يدوم العطر؟', 'faq.a1': 'يحصل معظم العملاء على ثبات من 6 إلى 8 ساعات. رشّه على نقاط النبض وعلى بشرة مرطّبة لأفضل نتيجة.', 'faq.q2': 'هل هو حجم عيّنة؟', 'faq.a2': 'لا، كل زجاجة ماء عطر كاملة بحجم 50 مل.', 'faq.q3': 'هل يمكنني دمجه مع عطر آخر؟', 'faq.a3': 'نعم. جرّبه مع عطر فانيليا أو خشبي لأثر أدفأ وأعمق.',
  'acc.paired': 'يُنسّق بشكل مثالي مع:', 'paired.note': 'ادمجهما للمسة دافئة ومحمّصة.', 'btn.addPrice': 'أضف – {p}',
  'trust.1': 'إرجاع<br>مجاني', 'trust.1s': 'مضمون', 'trust.2': 'صُنع<br>في فرنسا', 'trust.3': '+2 مليون<br>زجاجة مُباعة', 'trust.4': 'ثبات<br>يدوم', 'trust.4s': 'ماء عطر',
  'recs.title': 'قد يعجبك أيضاً', 'recs.more': 'عرض المزيد', 'recs.all': 'تم عرض كل العطور',
  'card.alt': 'يشبه هذه العطور', 'card.lux': 'مستوحى من {p}', 'insp.by': 'مستوحى من:', 'insp.Men': 'لـه', 'insp.Women': 'لـها', 'insp.Unisex': 'للجنسين', 'card.orig': 'نيش الأصلية',
  'rated.brand': 'تقييمات', 'rated.txt': 'نيش حاصلة على تقييم <b>ممتاز</b>.', 'rated.small': '4.8 ⓘ (أكثر من 1000 تقييم)',
  'rv.tab': 'التقييمات ({n})', 'qa.tab': 'الأسئلة', 'rv.based': 'بناءً على {n} تقييم', 'rv.rating': 'التقييم', 'rv.write': 'اكتب تقييماً', 'rv.sort': 'ترتيب',
  'sort.recent': 'الأحدث', 'sort.high': 'الأعلى تقييماً', 'sort.low': 'الأقل تقييماً', 'sort.helpful': 'الأكثر فائدة',
  'rv.more': 'عرض المزيد', 'rv.verified': 'مشترٍ موثّق', 'rv.rec': 'أنصح بهذا المنتج', 'rv.helpful': 'هل كان هذا مفيداً؟', 'rv.brand': 'فريق نيش', 'rv.empty': 'لا توجد تقييمات بـ {n} نجوم بعد.', 'rv.justnow': 'الآن', 'rv.starsAl': 'التقييمات ذات {n} نجوم',
  'qa.intro': 'لديك سؤال؟ يجيب فريقنا عادةً خلال يوم.', 'qa.ask': 'اطرح سؤالاً', 'qa.q': 'س:', 'qa.wait': 'بانتظار الإجابة',
  'seo': 'عطر فانيليا|عطر ياسمين|عطر عود|عطر باتشولي|عطر ورد|عطر لافندر|عطر جوز الهند|عطر غاردينيا|عطر عنبر|عطر مسك',
  'f.news': 'كن أول من يعرف.', 'f.email': 'أدخل بريدك الإلكتروني', 'f.submit': 'اشترك', 'f.nlBad': 'يرجى إدخال بريد إلكتروني صحيح.', 'f.nlOk': 'شكراً لاشتراكك! تفقّد بريدك ✉️',
  'f.vegan': 'نباتي<br>وخالٍ من القسوة', 'f.countries': 'نشحن إلى الدول التالية.', 'f.discover': 'اكتشف.', 'f.d1': 'العائلات العطرية', 'f.d2': 'طبقات العطور', 'f.d3': 'تسوّق حسب المناسبة', 'f.d5': 'اختبار اكتشاف العطر',
  'f.help': 'المساعدة.', 'f.h2': 'الإرجاع', 'f.h4': 'آراء العملاء', 'f.h5': 'إمكانية الوصول', 'f.h6': 'الانسحاب من العقد', 'f.h7': 'طلبات بيانات العملاء',
  'legal.privacy': 'سياسة الخصوصية', 'legal.terms': 'الشروط والأحكام', 'legal.cookies': 'إعلان ملفات الارتباط', 'legal.rights': '© {y} جميع الحقوق محفوظة',
  'sticky.btn': 'أضف إلى السلة · {p}',
  'cart.n1': 'قطعة واحدة', 'cart.n2': 'قطعتان', 'cart.nn': '{n} قطع', 'cart.oops': 'عذراً…', 'cart.empty': 'سلتك فارغة.<br>دعنا نساعدك!', 'cart.like': 'قد <b>ترغب بإضافة</b>', 'cart.shopAll': 'تسوّق كل العطور', 'cart.ship': 'شحن مجاني عند طلب قطعتين أو أكثر',
  'cart.max': '🎉 حصلت على <b>أقصى خصم 20%</b> + شحن مجاني!', 'cart.next': 'أضف <b>{n} إضافية</b> لتحصل على خصم <b>{d}%</b>{ship}', 'cart.nextShip': ' + شحن مجاني', 'cart.complete': 'أكمل <b>الباقة</b>',
  'cart.disc': 'خصم الباقة ({d}%)', 'cart.sub': 'المجموع الفرعي', 'cart.shipFree': 'تم تطبيق الشحن المجاني.', 'cart.shipCalc': 'يُحسب الشحن عند الدفع.', 'cart.tax': 'الأسعار شاملة الضريبة.', 'cart.checkout': 'إتمام الشراء', 'cart.rm': 'إزالة',
  'toast.demo': 'هذا قالب تجريبي — الدفع غير مفعّل.', 'toast.compare': 'يفتح بحث المقارنة في تبويب جديد',
  'search.popular': 'عمليات البحث الشائعة', 'search.products': 'المنتجات', 'search.none': 'لا توجد نتائج لـ «{q}». جرّب نوتة مثل فانيليا أو إجاص أو ورد.', 'search.showing': 'عرض العطور لـ «{q}»',
  'search.terms': 'فانيليا|فانيليا مدخّنة|دراسات الفانيليا|عسل|بستان العسل|إجاص|إجاص أبيض|لوز|لوز مخملي|كرز|كرز أسود|ورد|شاي الورد|شاي|ماتشا|حمضيات|ماتشا الحمضيات|زعفران|غسق الزعفران|كراميل|كراميل مملّح|مارشميلو|مارشميلو الغيم|تين|تين ذهبي|مسك ملح البحر|مسك|أرز|دخان الأرز|دخان|مشمش|خوخ|برغموت|نجيل الهند|غورماند|منعش|دافئ|زهري|ترابي',
  'mm.coll': 'تسوّق المجموعات', 'mm.sale': 'تخفيضات العيّنات', 'mm.insta': 'إنستغرام', 'mm.tiktok': 'تيك توك', 'mm.loc': 'الدولة / اللغة',
  'loc.title': 'الدولة واللغة', 'loc.country': 'الدولة/المنطقة', 'loc.search': 'ابحث عن دولة', 'loc.lang': 'اللغة', 'loc.update': 'تحديث', 'loc.none': 'لم يتم العثور على دولة', 'toast.loc': 'تتسوّق الآن في {c} · {l}',
  'cookie.title': 'نحترم خصوصيتك', 'cookie.text': 'يستخدم هذا الموقع ملفات تعريف الارتباط لضمان أفضل تجربة لك. <a href="#" class="u-link">اعرف المزيد</a>', 'cookie.accept': 'قبول', 'cookie.decline': 'رفض', 'cookie.prefs': 'التفضيلات',
  'cookie.nec': 'ضرورية<small>مطلوبة لعمل الموقع</small>', 'cookie.ana': 'تحليلية<small>تساعدنا على تحسين المتجر</small>', 'cookie.mkt': 'تسويقية<small>عروض مخصّصة لك</small>', 'cookie.save': 'حفظ التفضيلات',
  'lead.capT': 'الأكثر مبيعاً للنساء', 'lead.cap': 'مس، سكاندل وكوكو نيش', 'lead.close': 'إغلاق', 'lead.hi': 'أهلاً بك لأول مرة!', 'lead.h': 'تريد خصماً حتى <span class="coral">20%</span>؟', 'lead.p': 'انضم إلى قائمتنا البريدية المميزة لتحصل على عروض حصرية.', 'lead.ph': 'أدخل بريدك الإلكتروني هنا',
  'lead.fine': 'بالضغط على «التالي» توافق على تلقي رسائل تسويقية عبر البريد، ويمكنك إلغاء الاشتراك في أي وقت. راجع سياسة الخصوصية وشروط الخدمة.', 'lead.next': 'التالي', 'lead.no': 'لا، شكراً.',
  'lead.in': 'أنت معنا!', 'lead.h2': 'إليك خصم <span class="coral">20%</span>', 'lead.p2': 'استخدم هذا الرمز عند الدفع في طلبك الأول.', 'lead.copy': 'نسخ', 'lead.start': 'ابدأ التسوّق', 'lead.pill': 'احصل على خصم 20%', 'toast.copied': 'تم نسخ الرمز!', 'toast.code': 'الرمز: {c}',
  'offer.title': 'اجمع ووفّر', 'offer.2': 'عطران', 'offer.3': '3 عطور', 'offer.4': '4 عطور أو أكثر', 'offer.off': 'خصم {d}%', 'offer.note': 'يُطبَّق الخصم تلقائياً في السلة. شحن مجاني للطلبات التي تضم قطعتين أو أكثر.',
  'rf.review': 'اكتب تقييماً', 'rf.question': 'اطرح سؤالاً', 'rf.sub': 'بستان العسل · ماء عطر', 'rf.rating': 'تقييمك', 'rf.name': 'الاسم', 'rf.head': 'العنوان', 'rf.body': 'التقييم', 'rf.q': 'السؤال', 'rf.submit': 'إرسال', 'rf.defTitle': 'تقييمي', 'rf.starsAl': '{n} نجوم',
  'toast.needRating': 'يرجى اختيار عدد النجوم', 'toast.needFields': 'يرجى كتابة اسمك ورسالتك', 'toast.rvAdded': 'شكراً! تمت إضافة تقييمك.', 'toast.qAdded': 'شكراً! سنجيب قريباً.',
  'pip.hi': 'مرحباً، أنا بيب!', 'pip.pick': 'اختر نكهة المؤشر أثناء التصفح:', 'pip.hide': 'إخفاء بيب', 'pip.open': 'افتح بيب', 'toast.nap': 'بيب أخذ قيلولة 💤', 'toast.cursor': 'المؤشر: {f}',
  'flv.honey': 'قطرة عسل', 'flv.berry': 'فقاعة توت', 'flv.marsh': 'مارشميلو',
}};

/* ---- Scent notes for the showcase bottle (match the generated note illustrations) ---- */
Object.assign(I18N.en, {
  'cart.yourCart': 'Your cart', 'cart.summary': 'Order summary', 'cart.initial': 'Initial price:', 'cart.shipping': 'Shipping:', 'cart.buyMore': 'Buy more discount:', 'cart.free': 'Free', 'cart.go': 'Go to checkout',
  'cart.tierFree': 'FREE', 'cart.tierItems': '{n} items', 'cart.u1': 'item', 'cart.uN': 'items', 'cart.away': 'You’re {n} {u} away from <b>FREE shipping</b>', 'cart.awayDisc': 'Add {n} more {u} for <b>{d}% OFF</b>', 'cart.allIn': '<b>Free shipping + 20% OFF</b> unlocked', 'a.trash': 'Remove item', 'offer.n': '{n} perfumes',
  'notes.is': '<b>This perfume is:</b> A tropical escape of banana and cocoa',
  'card.new': 'New', 'f.cf': 'Animal<br>test-free', 'attr.int': 'Scent Intensity:', 'attr.intV': 'Soft', 'attr.intTip': 'Soft scents stay close to the skin: noticeable up close, never overpowering.', 'attr.conc': 'Concentration:', 'attr.gender': 'Gender:', 'ship.free': 'Shipping (2+ items)', 'ship.freeV': 'FREE', 'ship.std': 'Standard shipping', 'ship.stdV': '25 SAR', 'ship.ret': 'Returns', 'ship.retP': 'Return any order free of charge within 30 days of delivery, even if it’s been opened.', 'ship.more': 'Learn more', 'set.rich': 'Rich', 'set.clean': 'Clean', 'set.label': 'Card image style', 'note.banana': 'Banana', 'note.cocoa': 'Cocoa', 'note.blossom': 'Orange Blossom', 'note.macadamia': 'Macadamia', 'note.ylang': 'Ylang-Ylang', 'note.vanilla': 'Vanilla Orchid',
  'pyr.top': '<b>Top:</b> The first notes you smell<br>Banana, Cocoa, Orange Blossom',
  'pyr.mid': '<b>Middle:</b> The heart of the perfume<br>Macadamia, Ylang-Ylang',
  'pyr.base': '<b>Base:</b> The notes that linger all day<br>Vanilla Orchid, Amber Woods, Patchouli',
});
Object.assign(I18N.ar, {
  'cart.yourCart': 'سلتك', 'cart.summary': 'ملخص الطلب', 'cart.initial': 'السعر الأولي:', 'cart.shipping': 'الشحن:', 'cart.buyMore': 'خصم الكمية:', 'cart.free': 'مجاني', 'cart.go': 'المتابعة للدفع',
  'cart.tierFree': 'مجاني', 'cart.tierItems': '{n} قطع', 'cart.u1': 'قطعة', 'cart.uN': 'قطع', 'cart.away': 'تبقّى {n} {u} على <b>الشحن المجاني</b>', 'cart.awayDisc': 'أضف {n} {u} لتحصل على <b>خصم {d}%</b>', 'cart.allIn': 'حصلت على <b>شحن مجاني + خصم 20%</b>', 'a.trash': 'إزالة المنتج', 'offer.n': '{n} عطور',
  'notes.is': '<b>هذا العطر هو:</b> رحلة استوائية بطعم الموز والكاكاو',
  'card.new': 'جديد', 'f.cf': 'غير مختبر<br>على الحيوانات', 'attr.int': 'قوة الفوحان:', 'attr.intV': 'ناعم', 'attr.intTip': 'العطور الناعمة تبقى قريبة من البشرة: محسوسة عن قرب دون أن تكون طاغية.', 'attr.conc': 'التركيز:', 'attr.gender': 'الفئة:', 'ship.free': 'الشحن (قطعتان أو أكثر)', 'ship.freeV': 'مجاني', 'ship.std': 'الشحن العادي', 'ship.stdV': '25 ر.س', 'ship.ret': 'الإرجاع', 'ship.retP': 'أعد أي طلب مجاناً خلال 30 يوماً من الاستلام، حتى لو كان مفتوحاً.', 'ship.more': 'اعرف المزيد', 'set.rich': 'غنية', 'set.clean': 'نظيفة', 'set.label': 'نمط صور البطاقات', 'note.banana': 'موز', 'note.cocoa': 'كاكاو', 'note.blossom': 'زهر البرتقال', 'note.macadamia': 'ماكاديميا', 'note.ylang': 'يلانج يلانج', 'note.vanilla': 'أوركيد الفانيلا',
  'pyr.top': '<b>القمة:</b> أول ما تشمّه<br>موز، كاكاو، زهر البرتقال',
  'pyr.mid': '<b>القلب:</b> جوهر العطر<br>ماكاديميا، يلانج يلانج',
  'pyr.base': '<b>القاعدة:</b> ما يبقى طوال اليوم<br>أوركيد الفانيلا، أخشاب عنبرية، باتشولي',
});
let LANG = store.get('lang', 'ar');
if (!I18N[LANG]) LANG = 'ar';
const t = (k, v = {}) => String(I18N[LANG][k] ?? I18N.en[k] ?? k).replace(/\{(\w+)\}/g, (_, x) => v[x] ?? '');
const fmt = n => { const s = Number.isInteger(n) ? n.toLocaleString('en') : n.toLocaleString('en', {minimumFractionDigits: 2, maximumFractionDigits: 2}); return LANG === 'ar' ? `${s} ر.س` : `SAR ${s}`; };
const num = n => n.toLocaleString('en');

/* =====================================================================
   SVG ART (all original vector illustrations)
   ===================================================================== */
let uid = 0;
function rnd(seed) { let s = seed; return () => (s = (s * 9301 + 49297) % 233280) / 233280; }
const SHAPES = {
  berry: () => `<g><path d="M-2,-24 C-2,-34 6,-40 12,-44" stroke="#4b5d2a" stroke-width="2" fill="none"/><circle r="20" fill="#2b2240"/><circle cx="-7" cy="-7" r="6" fill="#fff" opacity=".22"/><path d="M-5,-19 L0,-14 L5,-19" stroke="#16101f" stroke-width="2" fill="none"/></g>`,
  peach: () => `<g><path d="M-48,18 C-40,-34 30,-46 50,-6 C22,-4 -12,6 -48,18Z" fill="#f08a3c"/><path d="M-40,14 C-30,-24 22,-36 42,-8 C16,-6 -10,3 -40,14Z" fill="#fbc56b"/><path d="M-30,10 C-18,-14 14,-22 30,-9" stroke="#f6a64a" stroke-width="3" fill="none" opacity=".6"/></g>`,
  apricot: () => `<g><defs><radialGradient id="ap${uid}" cx=".35" cy=".35"><stop offset="0" stop-color="#ffd27a"/><stop offset=".7" stop-color="#f59a3a"/><stop offset="1" stop-color="#e2702a"/></radialGradient></defs><circle r="24" fill="url(#ap${uid++})"/><path d="M0,-24 C-8,-8 -8,8 0,24" stroke="#d96a22" stroke-width="2" fill="none" opacity=".5"/><path d="M2,-24 C6,-34 16,-36 22,-32 C14,-28 8,-26 2,-24Z" fill="#6b9a3a"/></g>`,
  honey: () => `<g><path d="M-30,-6 C-34,-30 -6,-38 8,-28 C22,-36 40,-22 32,-4 C46,8 30,30 10,24 C0,40 -26,34 -24,16 C-40,12 -40,-2 -30,-6Z" fill="#e8a317" opacity=".92"/><ellipse cx="-10" cy="-12" rx="9" ry="5" fill="#fff" opacity=".45" transform="rotate(-25)"/><circle cx="16" cy="6" r="5" fill="#fff" opacity=".25"/></g>`,
  drop: () => `<g><path d="M0,-22 C10,-6 16,2 16,10 A16,16 0 0 1 -16,10 C-16,2 -10,-6 0,-22Z" fill="#eaa21a" opacity=".95"/><ellipse cx="-6" cy="6" rx="4" ry="7" fill="#fff" opacity=".4"/></g>`,
  leaf: () => `<g><path d="M0,34 C-30,4 -16,-30 22,-38 C28,-4 18,22 0,34Z" fill="#5f9a3a"/><path d="M0,34 C4,10 10,-14 22,-38" stroke="#3d6b22" stroke-width="2" fill="none"/></g>`,
  flower: () => `<g>${[0, 72, 144, 216, 288].map(a => `<ellipse cx="0" cy="-16" rx="10" ry="17" fill="#fffaf0" stroke="#eadfc6" transform="rotate(${a})"/>`).join('')}<circle r="7" fill="#f2c94c"/></g>`,
  vanilla: () => `<g><path d="M-60,50 C-20,10 10,-20 60,-56" stroke="#2b1d14" stroke-width="10" stroke-linecap="round" fill="none"/><path d="M-56,46 C-18,8 12,-20 56,-52" stroke="#4a3426" stroke-width="2" fill="none"/></g>`,
  almond: () => `<g><ellipse rx="13" ry="22" fill="#b9783f"/><ellipse cx="-4" cy="-6" rx="4" ry="9" fill="#d9a06a" opacity=".6"/><path d="M0,-20 C3,-6 3,6 0,20" stroke="#9a5f2c" fill="none"/></g>`,
  coffee: () => `<g><ellipse rx="13" ry="18" fill="#4a2c1a"/><path d="M0,-16 C-6,-6 6,6 0,16" stroke="#21120a" stroke-width="2.5" fill="none"/><ellipse cx="-5" cy="-7" rx="3" ry="5" fill="#fff" opacity=".15"/></g>`,
  cherry: () => `<g><path d="M0,-16 C2,-30 10,-40 18,-44" stroke="#4b6b2a" stroke-width="2.5" fill="none"/><circle r="17" fill="#8e1525"/><circle cx="-6" cy="-6" r="5" fill="#fff" opacity=".3"/></g>`,
  /* saffron: delicate tapered threads with golden tips */
  saffron: () => `<g fill="none" stroke-linecap="round">${[[-14, -30, -4], [-4, -36, 2], [6, -32, 8], [16, -26, 12], [-22, -20, -8]].map(([x, y, c], i) => `<path d="M${i * 1.5 - 3},32 C${c},10 ${x * .6},${y * .4} ${x},${y}" stroke="#b3202a" stroke-width="${1.6 - i * .12}"/><circle cx="${x}" cy="${y}" r="1.6" fill="#e9a23b" stroke="none"/>`).join('')}</g>`,
  pear: () => `<g><path d="M0,-30 C10,-30 12,-12 18,0 C30,20 22,40 0,40 C-22,40 -30,20 -18,0 C-12,-12 -10,-30 0,-30Z" fill="#e8d27a"/><path d="M0,-30 C6,-26 10,-14 14,-2 C22,16 16,32 0,34 C-12,34 -18,24 -12,8" fill="#f4e6ad"/><path d="M0,-30 L2,-42" stroke="#6b4a24" stroke-width="3" stroke-linecap="round"/></g>`,
  cinnamon: () => `<g transform="rotate(-30)"><rect x="-8" y="-40" width="16" height="80" rx="6" fill="#9a5a2c"/><path d="M-4,-40 V40 M3,-40 V40" stroke="#7a4220" stroke-width="2"/></g>`,
  citrus: () => `<g><circle r="26" fill="#f2d14b"/><circle r="21" fill="#fff6c9"/>${[0, 45, 90, 135].map(a => `<path d="M0,-20 V20" stroke="#f2d14b" stroke-width="2" transform="rotate(${a})"/>`).join('')}<circle r="3" fill="#fff"/></g>`,
  sugar: () => { const r = rnd(7); let s = ''; for (let i = 0; i < 34; i++) s += `<circle cx="${(r() - .5) * 70}" cy="${(r() - .5) * 60}" r="${1 + r() * 2.6}" fill="${i % 3 ? '#e8c27a' : '#d9a74f'}"/>`; return `<g>${s}</g>`; },
  rose: () => `<g>${[0, 60, 120, 180, 240, 300].map(a => `<ellipse cx="0" cy="-12" rx="12" ry="16" fill="#e48aa0" transform="rotate(${a})"/>`).join('')}<circle r="10" fill="#c95c78"/><path d="M-5,0 A5,5 0 1 1 5,0" stroke="#a8435f" stroke-width="2" fill="none"/></g>`,
  marshmallow: () => `<g><rect x="-20" y="-16" width="40" height="32" rx="10" fill="#f7c6d3"/><rect x="-20" y="-16" width="40" height="11" rx="8" fill="#fbdde6"/></g>`,
  smoke: () => `<g fill="none" stroke="#cfcac4" stroke-width="5" stroke-linecap="round" opacity=".8"><path d="M-30,30 C-10,10 -40,-10 -10,-30 C10,-44 -10,-60 10,-70"/><path d="M0,30 C20,10 -10,-10 20,-30" opacity=".5"/></g>`,
  fig: () => `<g><path d="M0,-34 C14,-24 26,-6 26,12 A26,26 0 0 1 -26,12 C-26,-6 -14,-24 0,-34Z" fill="#6b2c4a"/><ellipse cy="12" rx="16" ry="16" fill="#e07a8a"/><g fill="#fbe1c0">${[[-6, 6], [4, 10], [-2, 16], [8, 18], [-8, 18], [2, 4]].map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="1.6"/>`).join('')}</g></g>`,
  salt: () => { const r = rnd(3); let s = ''; for (let i = 0; i < 14; i++) { const x = (r() - .5) * 60, y = (r() - .5) * 50; s += `<rect x="${x}" y="${y}" width="${4 + r() * 5}" height="${4 + r() * 5}" fill="#fff" stroke="#ddd" transform="rotate(${r() * 90} ${x} ${y})"/>`; } return `<g>${s}</g>`; },
  matcha: () => `<g><circle r="26" fill="#9bbf5a"/><circle r="20" fill="#b7d47a"/><path d="M-10,-4 C-4,-12 6,-12 12,-2" stroke="#7da23f" stroke-width="2" fill="none"/></g>`,
  vetiver: () => `<g stroke="#b8935a" stroke-width="2.2" fill="none" stroke-linecap="round"><path d="M0,-34 C-4,-10 6,6 -2,34"/><path d="M-4,-20 C-16,-8 -10,10 -22,26"/><path d="M4,-24 C16,-12 10,8 24,22"/><path d="M0,0 C-10,6 -6,20 -12,34"/><path d="M2,6 C12,14 8,24 14,34"/></g>`,
  banana: () => '<g><path d="M-30,-18 C-34,10 -10,32 22,30 C30,29 34,24 30,20 C6,22 -14,8 -18,-16 Z" fill="#f4cf3a" stroke="#d9a91c" stroke-width="2"/><path d="M-30,-18 L-33,-26 L-27,-24 Z" fill="#6b4a24"/><path d="M-22,-8 C-18,10 -2,22 20,24" stroke="#fbe58a" stroke-width="3" fill="none"/></g>',
  cocoa: () => '<g><ellipse rx="17" ry="27" fill="#7a3f1d"/><path d="M0,-27 C-6,-10 -6,10 0,27 M-9,-23 C-14,-8 -14,8 -9,23 M9,-23 C14,-8 14,8 9,23" stroke="#5a2c12" stroke-width="2" fill="none"/><ellipse cx="-6" cy="-10" rx="4" ry="8" fill="#fff" opacity=".15"/></g>',
  macadamia: () => '<g><circle r="20" fill="#8a5a33"/><circle cx="4" cy="2" r="14" fill="#f3e3c2"/><circle cx="1" cy="-2" r="5" fill="#fff" opacity=".35"/></g>',
  ylang: () => '<g>' + [0, 60, 120, 180, 240, 300].map(a => '<path d="M0,0 C6,-10 4,-26 0,-32 C-4,-26 -6,-10 0,0Z" fill="#f2d24a" transform="rotate(' + a + ')"/>').join('') + '<circle r="5" fill="#b9902a"/></g>',
  bergamot: () => `<g><circle r="24" fill="#c6d64a"/><circle cx="-7" cy="-8" r="6" fill="#fff" opacity=".25"/><path d="M0,-24 C4,-32 12,-34 18,-30 C12,-26 6,-25 0,-24Z" fill="#5d8a2c"/></g>`,
};
const shape = (k, x, y, s = 1, r = 0, cls = '') => `<g class="${cls}" transform="translate(${x} ${y}) rotate(${r}) scale(${s})">${SHAPES[k]()}</g>`;

function bottle(o) {
  const id = 'b' + (uid++);
  const cap = o.cap === 'gold' ? ['#f6e6b8', '#c9a45a', '#fff4d6', '#a8833c'] : ['#f4f4f4', '#9a9a9a', '#ffffff', '#7a7a7a'];
  const x = o.x ?? 200, y = o.y ?? 210, s = o.s ?? 1;
  return `<g transform="translate(${x} ${y}) scale(${s}) translate(-200 -210)">
  <defs><linearGradient id="${id}c" x1="0" x2="1"><stop offset="0" stop-color="${cap[1]}"/><stop offset=".22" stop-color="${cap[2]}"/><stop offset=".45" stop-color="${cap[0]}"/><stop offset=".7" stop-color="${cap[3]}"/><stop offset="1" stop-color="${cap[1]}"/></linearGradient>
  <linearGradient id="${id}g" x1="0" x2="1"><stop offset="0" stop-color="#e9e7e2"/><stop offset=".12" stop-color="#fbfbfa"/><stop offset=".85" stop-color="#f2f1ee"/><stop offset="1" stop-color="#d9d6d0"/></linearGradient></defs>
  <ellipse cx="200" cy="372" rx="110" ry="10" fill="#000" opacity=".08"/>
  <rect x="160" y="62" width="80" height="92" rx="6" fill="url(#${id}c)"/><rect x="160" y="146" width="80" height="6" fill="#000" opacity=".08"/>
  <rect x="172" y="152" width="56" height="16" fill="#dad8d3"/>
  <rect x="104" y="166" width="192" height="202" rx="28" fill="url(#${id}g)" stroke="#dcd9d3"/>
  <rect x="104" y="300" width="192" height="68" rx="28" fill="${o.tint || '#f3e7c4'}" opacity=".35"/>
  <rect x="114" y="188" width="172" height="150" rx="6" fill="#f7f4ea"/>
  ${o.band ? `<rect x="114" y="188" width="172" height="10" fill="${o.accent}"/>` : ''}
  <g fill="${o.accent}" opacity=".85"><rect x="126" y="210" width="44" height="3"/><rect x="174" y="210" width="30" height="3" fill="#777"/><rect x="126" y="218" width="40" height="3"/><rect x="170" y="218" width="24" height="3" fill="#777"/><rect x="126" y="226" width="48" height="3"/><rect x="178" y="226" width="20" height="3" fill="#777"/></g>
  <text x="126" y="${o.sub ? 274 : 282}" font-family="Hanken Grotesk,Arial" font-weight="700" font-size="${o.fs || 17}" fill="${o.accent}" letter-spacing=".5">${o.label}</text>
  ${o.sub ? `<text x="126" y="292" font-family="Hanken Grotesk,Arial" font-weight="600" font-size="11" fill="#333">${o.sub}</text>` : ''}
  <text x="126" y="326" font-family="Archivo,Arial" font-stretch="125%" font-weight="500" font-size="15" fill="#3a3a3a">folio</text>
  <rect x="112" y="176" width="9" height="180" rx="4" fill="#fff" opacity=".7"/><rect x="276" y="180" width="5" height="170" rx="2" fill="#fff" opacity=".45"/>
  </g>`;
}
/* brand stamp — clean rounded tag with wordmark + pill sub-label */
const stamp = (x = 22, y = 22, s = 1) => `<g class="stamp" transform="translate(${x} ${y}) scale(${s})">
  <rect width="80" height="62" rx="13" fill="#fff" stroke="#1d1d1d" stroke-width="1.3"/>
  <text x="40" y="31" text-anchor="middle" font-family="Archivo,Arial" font-stretch="125%" font-weight="500" font-size="18" fill="#1d1d1d" letter-spacing=".3">folio</text>
  <rect x="16" y="39" width="48" height="12.5" rx="6.25" fill="none" stroke="#1d1d1d" stroke-width=".9"/>
  <text x="40" y="47.9" text-anchor="middle" font-family="Hanken Grotesk,Arial" font-weight="500" font-size="6.6" fill="#1d1d1d" letter-spacing=".45">impressions</text></g>`;
const bg = (c1, c2, id) => `<defs><radialGradient id="${id}" cx=".5" cy=".42" r=".75"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></radialGradient></defs><rect width="400" height="400" fill="url(#${id})"/>`;
const svg = (inner, vb = '0 0 400 400', cls = 'art') => `<svg class="${cls}" viewBox="${vb}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${inner}</svg>`;

const MARK = '<svg viewBox="16 18 88 96" aria-hidden="true"><path d="M24 56 A36 36 0 0 1 96 56 V90 Q96 95 91 95 Q87 95 87 99 V104 Q87 110 81.5 110 Q76 110 76 104 V100 Q76 95 71 95 H49 Q44 95 44 99 V101 Q44 106 39.5 106 Q35 106 35 101 V99 Q35 95 30 95 Q24 95 24 90 Z" fill="#fff" stroke="#1d1d1d" stroke-width="1.6" stroke-linejoin="round"/><text x="60" y="63" text-anchor="middle" font-family="Lobster Two,cursive" font-style="italic" font-weight="700" font-size="25" fill="#3b2318">Viva</text><text x="60" y="78" text-anchor="middle" font-family="Harir,Cairo,sans-serif" font-weight="600" font-size="7.4" fill="#1d1d1d">نيش</text><text x="60" y="86.5" text-anchor="middle" font-family="Hanken Grotesk,Arial,sans-serif" font-weight="600" font-size="3.9" letter-spacing=".3" fill="#1d1d1d">NICHE</text></svg>';
/* Viva line — Niche (images in assets/products, 1000×1000 from the brand store) */
// Niche bestsellers — names, prices, ratings, review counts, subtitles and inspirations from nicheksa.store
const PRODUCTS = {
  'althaer':      {en:'Althaer Niche',      ar:'الثائر نيش',       price:75, rating:4.9, count:92, g:'Men',    fam:'Gourmand', insp:['Parfums de Marly Althaïr', 'ألثاير من بارفامز دي مارلي'],         sub:['A warm, luxurious vanilla scent', 'عطر فاخر دافئ وفانيليا']},
  'sauvage':      {en:'Sauvage Niche',      ar:'سوفاج نيش',        price:75, rating:4.9, count:77, g:'Men',    fam:'Fresh',    insp:['Dior Sauvage', 'سوفاج من ديور'],                                  sub:['A fresh, bold men’s scent', 'عطر رجالي منعش وجريء']},
  'blue':         {en:'Blue Niche',         ar:'بلو نيش',          price:75, rating:4.8, count:56, g:'Men',    fam:'Fresh',    insp:['Bleu de Chanel', 'بلو دي شانيل'],                                 sub:['A fresh, elegant men’s scent', 'عطر رجالي منعش وأنيق']},
  'miss':         {en:'Miss Niche',         ar:'مس نيش',           price:75, rating:4.8, count:32, g:'Women',  fam:'Flowery',  insp:['Miss Dior', 'مس ديور'],                                           sub:['A soft, elegant women’s scent', 'عطر نسائي ناعم أنيق']},
  'strong':       {en:'Strong Niche',       ar:'سترونق نيش',       price:75, rating:5,   count:31, g:'Men',    fam:'Warm',     insp:['Giorgio Armani Stronger With You', 'سترونغر ويذ يو من جورجيو أرماني'], sub:['A warm men’s scent with modern appeal', 'عطر رجالي دافئ بجاذبية عصرية']},
  'homme':        {en:'Homme Niche',        ar:'هوم نيش',          price:75, rating:4.9, count:26, g:'Men',    fam:'Earthy',   insp:['Dior Homme Intense', 'ديور هوم إنتنس'],                           sub:['A refined, luxurious men’s scent', 'عطر رجالي فاخر وأنيق']},
  'leather':      {en:'Tuscan Leather Niche', ar:'توسكان لذر نيش', price:75, rating:4.9, count:23, g:'Unisex', fam:'Earthy',   insp:['Tom Ford Tuscan Leather', 'توسكان ليذر من توم فورد'],             sub:['A bold, luxurious leather scent', 'عطر جلدي فاخر وجريء']},
  'allure-sport': {en:'Allure Sport Niche', ar:'الور نيش',         price:75, rating:4.7, count:20, g:'Men',    fam:'Fresh',    insp:['Chanel Allure Homme Sport', 'ألور هوم سبورت من شانيل'],           sub:['A fresh, elegant sporty scent', 'عطر رياضي منعش وأنيق']},
  'scandal':      {en:'Scandal Niche',      ar:'سكاندل نيش',       price:75, rating:4.9, count:18, g:'Women',  fam:'Gourmand', insp:['Jean Paul Gaultier Scandal', 'سكاندال من جان بول غوتييه'],       sub:['A bold, honeyed women’s scent', 'عطر أنثوي جريء وعسلي']},
  'libre':        {en:'Libre Niche',        ar:'ليبر نيش',         price:75, rating:4.9, count:17, g:'Women',  fam:'Flowery',  insp:['YSL Libre', 'ليبر من إيف سان لوران'],                             sub:['A bold, luxurious women’s scent', 'عطر أنثوي جريء وفاخر']},
  'coco':         {en:'Coco Niche',         ar:'كوكو نيش',         price:75, rating:5,   count:14, g:'Women',  fam:'Flowery',  insp:['Chanel Coco Mademoiselle', 'كوكو مادموازيل من شانيل'],           sub:['A luxurious floral oriental scent', 'عطر زهري شرقي فاخر']},
  'ultra':        {en:'Ultra Niche',        ar:'ألترا نيش',        price:75, rating:5,   count:13, g:'Men',    fam:'Warm',     insp:['Jean Paul Gaultier Le Male', 'لو ميل من جان بول غوتييه'],         sub:['A warm aromatic scent with a fresh twist', 'عطر عطري دافئ بانتعاش مميز']},
};
const pname = k => PRODUCTS[k][LANG] || PRODUCTS[k].en;
const FAM_PILL = {Gourmand:'linear-gradient(to right bottom,#ffcd8d,#e95534)', Warm:'linear-gradient(to right bottom,#fff1a8,#f6c443)', Flowery:'linear-gradient(to right bottom,#fde7ee,#f4a9c0)', Fresh:'linear-gradient(to right bottom,#dff5e9,#8fd3b5)', Earthy:'linear-gradient(to right bottom,#efe3cc,#c7a97a)'};
let CARD_SET = new URLSearchParams(location.search).get('cards') === 'clean' || store.get('cardSet', 'cards') === 'cards-clean' ? 'cards-clean' : 'cards';
const IMG = (k, n) => `assets/products/niche-${k}${n === 2 ? '-2' : ''}.webp`;
const offPct = p => p.compare ? Math.round((1 - p.price / p.compare) * 100) : 0;

function productArt(key, mini) {
  return `<img class="art" src="${IMG(key)}" alt="${esc(pname(key))}" loading="lazy" decoding="async" width="${mini ? 200 : 1000}" height="${mini ? 200 : 1000}">`;
}
// "inspired by" strip over a product image: the original bottle, its name, and who it's for (+ optional quick add)
function inspStrip(k, add) {
  const p = PRODUCTS[k];
  return `<div class="insp"><img class="insp__img" src="assets/products/inspired/${k}.webp" alt="" width="36" height="36" loading="lazy">
    <span class="insp__txt"><span>${t('insp.by')} <b>${esc(L(p.insp))}</b></span><small>${t('insp.' + p.g)}</small></span>
    ${add ? `<button class="insp__add" data-add="${k}" aria-label="${t('p.atc')}">+</button>` : ''}</div>`;
}
/* the product card used everywhere (drops, featured, shop grid, bundle builder).
   o: {img, tag: [en, ar] eyebrow, cls, attrs, bundle: {inB, price}} */
function pcard(k, o = {}) {
  const p = PRODUCTS[k];
  const rev = p.count ? `<span class="stars">${starsHTML(p.rating)}</span><span>${num(p.count)}</span>` : `<span class="card__new">${t('card.new')}</span>`;
  const btn = o.bundle
    ? `<button type="button" class="btn pcard__btn${o.bundle.inB ? ' is-in' : ''}" data-bundle="${k}">${t(o.bundle.inB ? 'bnd.added' : 'bnd.add')}</button>`
    : `<button class="btn pcard__btn" data-add="${k}">${t('p.atc')}</button>`;
  return `<article class="pcard${o.cls ? ' ' + o.cls : ''}"${o.attrs || ''}>
    <img class="pcard__img" src="${o.img || IMG(k)}" alt="${esc(pname(k))}" loading="lazy">
    ${inspStrip(k)}
    <div class="pcard__body">
      ${o.tag ? `<span class="pcard__eyebrow">${esc(L(o.tag))}</span>` : ''}
      <div class="pcard__head"><h3 class="pcard__name">${esc(pname(k))}</h3><span class="pcard__price">${o.bundle ? o.bundle.price : fmt(p.price)}</span></div>
      <div class="pcard__meta"><span class="pcard__rev">${rev}</span><span class="pcard__fam">${t('fam.' + p.fam)}</span></div>
      ${btn}
    </div></article>`;
}
function altArt(key) {
  return `<img class="art art--alt" src="${IMG(key, 2)}" alt="" loading="lazy" decoding="async" width="1000" height="1000">`;
}

const ART = {
  hero: () => svg(bg('#ffffff', '#efede8', 'hg') +
    shape('drop', 132, 14, .9, 20, 'floaty') + shape('berry', 318, 58, 1.05, 10) + shape('berry', 350, 92, .95, -20) + shape('berry', 330, 128, 1, 25) +
    shape('berry', 30, 168, .9, 30, 'floaty') + shape('berry', 68, 238, 1, -10) + shape('berry', 14, 300, .9, 0) +
    shape('honey', 372, 250, 1.7, 0) + shape('drop', 352, 360, .9, -10, 'floaty') +
    bottle({label: 'HONEY ORCHARD', sub: 'Eau de parfum', accent: '#d9a441', fs: 16, s: .86, y: 214}) +
    shape('peach', 20, 380, 1.9, -35) + stamp(18, 18, .9)),
  orange: () => svg(bg('#f7b267', '#ef7a42', 'og') +
    shape('berry', 300, 40, 1.2) + shape('berry', 340, 70, 1) + shape('berry', 30, 100, 1) + shape('honey', 350, 210, 1.8) +
    bottle({label: 'HONEY', sub: 'ORCHARD', accent: '#d9a441', fs: 20, s: .9, y: 215, tint: '#fbd2a0'}) + shape('peach', 70, 330, 2.2, -20)),
  box: () => svg(`<rect width="400" height="400" fill="#f3efe9"/>
    <g transform="translate(200 200)"><path d="M-110,-40 L110,-40 L110,120 L-110,120Z" fill="#e8574b"/><path d="M-110,-40 L-150,-120 L80,-150 L110,-40Z" fill="#f06b5d"/><path d="M110,-40 L150,-110 L130,-40Z" fill="#c9443a"/><path d="M-110,-40 L110,-40 L95,-20 L-95,-20Z" fill="#c13d33"/>
    <text x="-45" y="-100" font-family="Archivo,Arial" font-stretch="125%" font-weight="700" font-size="13" fill="#fff" transform="rotate(-7)">BIG SCENTS.</text>
    <text x="-55" y="-82" font-family="Archivo,Arial" font-stretch="125%" font-weight="700" font-size="13" fill="#fff" transform="rotate(-7)">SMALL PRICES.</text>
    <rect x="-80" y="-14" width="160" height="128" fill="#f4ede3"/></g>${bottle({label: 'HONEY', sub: 'ORCHARD', accent: '#d9a441', s: .48, x: 200, y: 268})}
    <g transform="translate(40 300) rotate(-18)"><rect width="120" height="80" fill="#f7d9bf"/><g fill="#c9a68a"><rect x="10" y="12" width="60" height="4"/><rect x="10" y="22" width="90" height="3"/><rect x="10" y="30" width="80" height="3"/><rect x="10" y="38" width="86" height="3"/><rect x="10" y="46" width="70" height="3"/></g></g>`),
  kraft: () => svg(`<rect width="400" height="400" fill="#f2efea"/>
    <g transform="translate(250 220)"><path d="M-110,-20 L40,-80 L130,-30 L-20,40Z" fill="#f4ece0"/><path d="M-110,-20 L-20,40 L-20,120 L-110,60Z" fill="#e6dccb"/><path d="M-20,40 L130,-30 L130,50 L-20,120Z" fill="#ece3d3"/>
    <text x="0" y="-10" font-family="Archivo,Arial" font-stretch="125%" font-size="12" fill="#6b5f50" transform="rotate(-24)">folio</text></g>
    ${bottle({label: 'HONEY', sub: 'ORCHARD', accent: '#d9a441', s: .62, x: 120, y: 230})}`),
  scene: () => svg(`<defs><linearGradient id="scg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f7f8fa"/><stop offset="1" stop-color="#dfe3e8"/></linearGradient></defs><rect width="400" height="400" fill="url(#scg)"/>
    <path d="M0,0 L120,0 L60,400 L0,400Z" fill="#e9ecef"/><g fill="#fff" opacity=".7">${Array.from({length: 40}, (_, i) => `<circle cx="${10 + (i * 37) % 100}" cy="${(i * 53) % 400}" r="${2 + i % 4}"/>`).join('')}</g>
    <path d="M140,320 L400,180 L400,400 L80,400Z" fill="#000" opacity=".06"/>
    ${bottle({label: 'HONEY', sub: 'ORCHARD', accent: '#d9a441', s: .55, x: 210, y: 220})}<ellipse cx="330" cy="330" rx="80" ry="22" fill="#fff" opacity=".9"/>`),
  mist: () => svg(`<defs><linearGradient id="msg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fde3c8"/><stop offset=".6" stop-color="#f7b38a"/><stop offset="1" stop-color="#ef8f72"/></linearGradient><filter id="blr"><feGaussianBlur stdDeviation="14"/></filter></defs>
    <rect width="400" height="400" fill="url(#msg)"/><circle cx="300" cy="90" r="60" fill="#fff4d6" filter="url(#blr)"/><circle cx="80" cy="320" r="90" fill="#f9c48a" opacity=".6" filter="url(#blr)"/>
    ${bottle({label: 'HONEY', sub: 'ORCHARD', accent: '#d9a441', s: .6, x: 150, y: 250})}
    <g transform="translate(205 140)">${Array.from({length: 9}, (_, i) => `<circle class="mist" style="animation-delay:${i * .4}s" cx="${i * 4}" cy="${-i * 3}" r="${6 + i * 2}" fill="#fff" opacity="0"/>`).join('')}</g>`),
  megaAll: () => svg(`<defs><linearGradient id="mga" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f9a65a"/><stop offset="1" stop-color="#ec6a3b"/></linearGradient></defs><rect width="400" height="245" fill="url(#mga)"/>` +
    shape('drop', 340, 50, .9) + shape('berry', 60, 60, .8) + bottle({label: 'HONEY', sub: 'ORCHARD', accent: '#d9a441', s: .55, x: 160, y: 132}) + bottle({label: 'BLACK', sub: 'CHERRY', accent: '#8e1525', s: .5, x: 262, y: 142, band: true}), '0 0 400 245'),
  megaImp: () => svg(`<defs><linearGradient id="mgi" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9c6ad"/><stop offset="1" stop-color="#9a6a45"/></linearGradient></defs><rect width="400" height="245" fill="url(#mgi)"/>
    <ellipse cx="200" cy="218" rx="140" ry="26" fill="#7a4a2a"/><rect x="60" y="205" width="280" height="40" fill="#7a4a2a"/>` + shape('cinnamon', 90, 160, .9, 40) + shape('flower', 320, 70, 1) + bottle({label: 'SMOKED', sub: 'VANILLA', accent: '#b8873b', s: .55, x: 205, y: 112}) + stamp(320, 20, .7).replace('class="stamp"', ''), '0 0 400 245'),
  megaOrig: () => svg(`<defs><linearGradient id="mgo" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7a2d2a"/><stop offset="1" stop-color="#2f1a1a"/></linearGradient></defs><rect width="400" height="245" fill="url(#mgo)"/>` +
    shape('saffron', 90, 150, 1.4, -10) + shape('cherry', 320, 170, 1) + shape('cherry', 340, 120, .8, 20) + bottle({label: 'GOLDEN', sub: 'FIG', accent: '#7a4a2a', s: .55, x: 205, y: 118, cap: 'gold'}), '0 0 400 245'),
  lead: () => svg(`<rect width="464" height="600" fill="#ecebe8"/><circle cx="232" cy="300" r="190" fill="#f7d3b0"/>
    ${shape('peach', 110, 140, 2, -30, 'floaty')}${shape('honey', 360, 140, 2.2, 10, 'floaty')}${shape('berry', 380, 420, 1.6, 0, 'floaty')}${shape('pear', 80, 450, 1.8, -10, 'floaty')}
    ${bottle({label: 'HONEY', sub: 'ORCHARD', accent: '#d9a441', s: .62, x: 160, y: 330})}${bottle({label: 'WHITE', sub: 'PEAR', accent: '#d9822b', s: .62, x: 300, y: 350, band: true})}
    ${bottle({label: 'GOLDEN', sub: 'FIG', accent: '#7a4a2a', s: .5, x: 232, y: 440, cap: 'gold'})}`, '0 0 464 600'),
};

/* Mascot — the black perfume bottle */
let flavor = store.get('flavor', 'honey');
if (!['honey', 'berry', 'marsh'].includes(flavor)) flavor = 'honey';
function pip(w = 78) {
  return `<svg class="pip-img" viewBox="88 72 336 368" width="${w}" height="${w}" fill="none" aria-hidden="true"><rect x="168" y="88" width="176" height="106" rx="14" fill="#222"/><rect x="149" y="213" width="214" height="211" rx="24" stroke="#222" stroke-width="22"/><rect x="149" y="246" width="214" height="146" fill="#222"/></svg>`;
}

const STAR = '<svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 1.5l2.6 5.6 6 .7-4.5 4.1 1.2 6L10 15l-5.3 2.9 1.2-6L1.4 7.8l6-.7z"/></svg>';
const STAR_HALF = () => { const id = 'hs' + (uid++); return `<svg class="half" viewBox="0 0 20 20"><defs><linearGradient id="${id}"><stop offset=".5" stop-color="currentColor"/><stop offset=".5" stop-color="#d8d2ca"/></linearGradient></defs><path fill="url(#${id})" d="M10 1.5l2.6 5.6 6 .7-4.5 4.1 1.2 6L10 15l-5.3 2.9 1.2-6L1.4 7.8l6-.7z"/></svg>`; };
const STAR_OFF = STAR.replace('<svg', '<svg style="color:#d8d2ca"');
const starsHTML = r => Array.from({length: 5}, (_, i) => r >= i + 1 ? STAR : r > i + .25 ? STAR_HALF() : STAR_OFF).join('');

/* one-time art render */
$$('[data-art]').forEach(el => { el.outerHTML = ART[el.dataset.art](); });
$$('[data-art-mini]').forEach(el => { el.outerHTML = productArt(el.dataset.artMini, true); });
$$('[data-stars]').forEach(el => el.innerHTML = starsHTML(+el.dataset.stars));
$p('.rated__boxes').innerHTML = Array.from({length: 5}, () => `<i>${STAR}</i>`).join('');
$$('[data-pyr]').forEach(el => { const lvl = +el.dataset.pyr, on = 3 - lvl; el.setAttribute('viewBox', '0 0 22 34'); el.innerHTML =
  '<g fill="none" stroke="#212121" stroke-width="1.4" stroke-linejoin="round"><path d="M8.5 1.2h5v3.3h-5zM7 4.5h8v3H7zM9 7.5h4v2.3H9z"/><rect x="1.7" y="9.8" width="18.6" height="22.6" rx="2"/><path d="M1.7 17.3h18.6M1.7 24.9h18.6"/></g>' +
  [0, 1, 2].map(i => i === on ? '<rect x="1.7" y="' + (24.9 - i * 7.55) + '" width="18.6" height="7.5" rx="' + (i === 0 ? 2 : 0) + '" fill="#212121"/>' : '').join(''); });

/* =====================================================================
   TOAST + small helpers
   ===================================================================== */
function toast(msg) {
  const el = document.createElement('div'); el.className = 'toast'; el.textContent = msg;
  $('#toasts').appendChild(el);
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 360); }, 2400);
}
document.addEventListener('click', e => {
  const a = e.target.closest('[data-toast-k]'); if (a) { e.preventDefault(); toast(t(a.dataset.toastK)); return; }
  const dead = e.target.closest('a[href="#"]'); if (dead && !dead.dataset.open) e.preventDefault();
  if (e.target.closest('[data-back]')) { e.preventDefault(); history.length > 1 ? history.back() : null; }
});
function lock(on) { document.documentElement.classList.toggle('no-scroll', on); window.__lenis?.[on ? 'stop' : 'start'](); }
let lastFocus = null;

/* =====================================================================
   CURSOR: calligraphic cursor/pointer (set in CSS) + bottle companion that trails the mouse
   ===================================================================== */
const FLAVORS = {honey: {c: '#f2a93b', s: '#a8660f'}, berry: {c: '#9a6ad6', s: '#4a2585'}, marsh: {c: '#f6b6c8', s: '#b85a78'}};
function renderPips() {
  $$('[data-mascot]').forEach(el => el.innerHTML = pip());
  $$('[data-peek]').forEach(el => el.innerHTML = pip(66, el.dataset.peek));
  $('#buddyFig').innerHTML = pip(34);
}
function renderFlavors() {
  const fl = $('#flavors'); if (!fl) return;
  fl.innerHTML = Object.keys(FLAVORS).map(k => `<button data-f="${k}" class="${k === flavor ? 'is-on' : ''}"><i style="background:${FLAVORS[k].c}"></i>${t('flv.' + k)}</button>`).join('');
}
function setFlavor(f) {
  flavor = f; store.set('flavor', f);
  renderFlavors(); renderPips();
  if (typeof renderCart === 'function' && cart && !cartQty()) renderCart();
}

const canHover = matchMedia('(hover:hover) and (pointer:fine)').matches;
// perfume spray: soft mist puffs billow out radially from the click point, with a fast ring of fine droplets
function spray(x, y) {
  const box = document.createElement('div');
  box.className = 'spray';
  box.style.cssText = `left:${x}px;top:${y}px`;
  const out = (a, d) => [Math.cos(a) * d, Math.sin(a) * d];
  for (let i = 0; i < 16; i++) {
    const a = i / 16 * Math.PI * 2 + (Math.random() - .5) * .5, size = 26 + Math.random() * 30;
    const [dx, dy] = out(a, 26 + Math.random() * 34);
    const p = document.createElement('i');
    p.className = 'spray__puff';
    p.style.cssText = `width:${size}px;height:${size}px`;
    box.appendChild(p);
    p.animate([
      {transform: 'translate(-50%,-50%) scale(.2)', opacity: .9},
      {transform: `translate(calc(-50% + ${dx * .6}px),calc(-50% + ${dy * .6}px)) scale(1.3)`, opacity: .55, offset: .35},
      {transform: `translate(calc(-50% + ${dx}px),calc(-50% + ${dy - 14}px)) scale(2.1)`, opacity: 0}
    ], {duration: 900 + Math.random() * 500, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'forwards'});
  }
  for (let i = 0; i < 26; i++) {
    const [dx, dy] = out(Math.random() * Math.PI * 2, 40 + Math.random() * 46);
    const d = document.createElement('i');
    d.className = 'spray__drop';
    box.appendChild(d);
    d.animate([
      {transform: 'translate(-50%,-50%) scale(1)', opacity: 1},
      {transform: `translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) scale(.3)`, opacity: 0}
    ], {duration: 450 + Math.random() * 300, easing: 'cubic-bezier(.1,.8,.3,1)', fill: 'forwards'});
  }
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 1500);
}
(() => {
  const buddy = $('#buddy'), fig = $('#buddyFig');
  if (!canHover) return;
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const OFF_X = 18, OFF_Y = 16, EASE = .2;
  const CTA = 'a, button, summary, select, label, .card, .media-item, .note, [role=button], .chip--info';
  let tx = 0, ty = 0, x = 0, y = 0, vx = 0, started = false, idleT, raf = 0;
  const setIdle = () => { clearTimeout(idleT); buddy.classList.remove('is-idle'); idleT = setTimeout(() => buddy.classList.add('is-idle'), 2500); };
  function loop() {
    const dx = tx - x, dy = ty - y;
    x += dx * (reduce ? 1 : EASE); y += dy * (reduce ? 1 : EASE);
    vx += (dx - vx) * .25;
    const rot = Math.max(-12, Math.min(12, vx * .35)), bob = -Math.min(5, Math.hypot(dx, dy) * .06);
    buddy.style.transform = `translate3d(${x}px,${y}px,0)`;
    fig.style.transform = Math.abs(dx) + Math.abs(dy) < .3 ? '' : `translateY(${bob}px) rotate(${rot}deg)`;
    raf = Math.abs(dx) + Math.abs(dy) > .1 ? requestAnimationFrame(loop) : 0;
  }
  addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    tx = e.clientX + OFF_X; ty = e.clientY + OFF_Y;
    if (!started) { x = tx; y = ty; started = true; }
    buddy.classList.add('is-active');
    buddy.classList.toggle('is-over-cta', !!e.target.closest?.(CTA));
    setIdle();
    if (!raf) raf = requestAnimationFrame(loop);
  }, {passive: true});
  document.documentElement.addEventListener('mouseleave', () => { buddy.classList.remove('is-active'); started = false; });
  addEventListener('blur', () => buddy.classList.remove('is-active'));
  addEventListener('pointerdown', e => {
    if (e.pointerType !== 'mouse' || !started) return;
    setIdle();
    buddy.classList.remove('is-hopping'); void buddy.offsetWidth; buddy.classList.add('is-hopping');
    setTimeout(() => buddy.classList.remove('is-hopping'), 560);
    if (reduce) return;
    spray(e.clientX, e.clientY);
  });
})();

/* =====================================================================
   ANNOUNCEMENT ROTATOR
   ===================================================================== */
(() => {
  const msgs = $$('#annTrack .ann__msg'), box = $('.ann__inner'); let i = 0, paused = false;
  box.addEventListener('mouseenter', () => paused = true);
  box.addEventListener('mouseleave', () => paused = false);
  setInterval(() => {
    if (paused || document.hidden) return;
    const cur = msgs[i]; cur.classList.remove('is-active'); cur.classList.add('is-leaving');
    setTimeout(() => cur.classList.remove('is-leaving'), 520);
    i = (i + 1) % msgs.length; msgs[i].classList.add('is-active');
  }, 4200);
})();

/* =====================================================================
   HEADER DROPDOWNS (hover + click + keyboard)
   ===================================================================== */
const menuScrim = $('#menuScrim');
let openDD = null, ddTimer, ddByHover = false;
function closeDD(returnFocus) {
  if (!openDD) return;
  const btn = $(`[data-dd="${openDD}"]`);
  $('#' + openDD).classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false');
  menuScrim.classList.remove('is-open'); openDD = null;
  $('#megaPerfumes').classList.remove('is-sub');
  if (returnFocus) btn.focus({preventScroll: true});
}
function showDD(id, kb, hover) {
  if (openDD === id) return; closeDD();
  openDD = id; ddByHover = !!hover;
  $('#' + id).classList.add('is-open');
  $(`[data-dd="${id}"]`).setAttribute('aria-expanded', 'true');
  menuScrim.classList.add('is-open');
  if (kb) setTimeout(() => $('#' + id).querySelector('a, button')?.focus({preventScroll: true}), 60);
}
$$('[data-dd]').forEach(btn => {
  const id = btn.dataset.dd, panel = $('#' + id);
  btn.setAttribute('aria-controls', id);
  btn.addEventListener('click', e => {
    const kb = e.detail === 0;
    if (openDD === id) { if (!kb && ddByHover) { ddByHover = false; return; } closeDD(kb); }
    else showDD(id, kb);
  });
  btn.addEventListener('keydown', e => {
    if (e.key === 'Tab' && !e.shiftKey && openDD === id) { e.preventDefault(); panel.querySelector('a, button')?.focus(); }
  });
  panel.addEventListener('keydown', e => {
    if (e.key === 'Escape') { e.stopPropagation(); closeDD(true); return; }
    if (e.key !== 'Tab') return;
    const f = $$('a, button', panel).filter(x => x.offsetParent !== null && getComputedStyle(x).visibility !== 'hidden');
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); btn.focus(); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) {
      e.preventDefault(); closeDD();
      const hf = $$('a[href], button', $('#header')).filter(x => !x.closest('.dd') && x.getClientRects().length);
      (hf[hf.indexOf(btn) + 1] || btn).focus();
    }
  });
  if (canHover) {
    btn.addEventListener('mouseenter', () => { clearTimeout(ddTimer); ddTimer = setTimeout(() => showDD(id, false, true), 120); });
    btn.addEventListener('mouseleave', () => { clearTimeout(ddTimer); ddTimer = setTimeout(() => { if (!panel.matches(':hover')) closeDD(); }, 220); });
    panel.addEventListener('mouseenter', () => clearTimeout(ddTimer));
    panel.addEventListener('mouseleave', () => { ddTimer = setTimeout(() => closeDD(), 220); });
  }
});
menuScrim.addEventListener('click', () => closeDD());
$$('.dd a').forEach(a => a.addEventListener('click', () => closeDD()));
$('[data-mega-sub]').addEventListener('click', () => { $('#megaPerfumes').classList.add('is-sub'); setTimeout(() => $('[data-mega-back]').focus({preventScroll: true}), 60); });
$('[data-mega-back]').addEventListener('click', () => { $('#megaPerfumes').classList.remove('is-sub'); $('[data-mega-sub]').focus({preventScroll: true}); });
$$('[data-fam]').forEach(b => b.addEventListener('click', () => { const open = b.getAttribute('aria-expanded') !== 'true'; b.setAttribute('aria-expanded', open); b.nextElementSibling.classList.toggle('is-open', open); }));
const topbar = $('#topbar');
addEventListener('scroll', () => topbar.classList.toggle('is-scrolled', scrollY > 10), {passive: true});

/* =====================================================================
   DRAWERS + MODALS
   ===================================================================== */
const drawerScrim = $('#drawerScrim');
function openDrawer(el) {
  closeDD(); lastFocus = document.activeElement;
  $$('.drawer.is-open').forEach(d => d !== el && closeDrawer(d, true));
  el.classList.add('is-open'); el.setAttribute('aria-hidden', 'false');
  drawerScrim.classList.add('is-open'); lock(true);
  setTimeout(() => (el.querySelector('button, a, input') || el).focus({preventScroll: true}), 60);
}
function closeDrawer(el, silent) {
  el = el || $('.drawer.is-open'); if (!el) return;
  el.classList.remove('is-open'); el.setAttribute('aria-hidden', 'true');
  if (!silent) { drawerScrim.classList.remove('is-open'); if (!$('.modal.is-open')) lock(false); lastFocus?.focus?.({preventScroll: true}); }
}
drawerScrim.addEventListener('click', () => closeDrawer());
document.addEventListener('click', e => { if (e.target.closest('[data-close-drawer]')) closeDrawer(e.target.closest('.drawer')); });

function openModal(id) {
  const m = $('#' + id); if (!m) return;
  closeDD(); if ($('.drawer.is-open')) closeDrawer();
  lastFocus = document.activeElement;
  m.classList.add('is-open'); lock(true);
  m.dispatchEvent(new CustomEvent('modal:open'));
  setTimeout(() => (m.querySelector('input:not([type=checkbox]):not([type=radio]), .btn, button') || m).focus({preventScroll: true}), 80);
}
function closeModal(m) {
  m = m || $$('.modal.is-open').pop(); if (!m) return;
  m.classList.remove('is-open');
  if (!$('.modal.is-open') && !$('.drawer.is-open') && !$('#lightbox.is-open') && !$('#search.is-open')) lock(false);
  lastFocus?.focus?.({preventScroll: true});
  m.dispatchEvent(new CustomEvent('modal:close'));
}
document.addEventListener('click', e => {
  const o = e.target.closest('[data-open]');
  if (o) { e.preventDefault(); openModal(o.dataset.open); if (o.dataset.open === 'reviewModal') setReviewMode(o.dataset.mode || 'review'); }
  const c = e.target.closest('[data-close-modal]'); if (c) { e.preventDefault(); closeModal(c.closest('.modal')); }
});
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if ($('#lightbox.is-open')) return closeLightbox();
  if ($('.modal.is-open')) { const m = $$('.modal.is-open').pop(); if (m.id !== 'cookieModal') closeModal(m); return; }
  if ($('#search.is-open')) return closeSearch();
  if ($('.drawer.is-open')) return closeDrawer();
  closeDD(true);
});
/* focus trap */
document.addEventListener('keydown', e => {
  if (e.key !== 'Tab') return;
  const root = $$('.modal.is-open').pop() || $('#lightbox.is-open') || $('#search.is-open') || $('.drawer.is-open');
  if (!root) return;
  const f = $$('a[href], button:not([disabled]), input:not([disabled]):not([type=hidden]), select, textarea, [tabindex]:not([tabindex="-1"])', root)
    .filter(x => x.getClientRects().length && getComputedStyle(x).visibility !== 'hidden');
  if (!f.length) return;
  const first = f[0], last = f[f.length - 1];
  if (!root.contains(document.activeElement)) { e.preventDefault(); (e.shiftKey ? last : first).focus(); return; }
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});

/* =====================================================================
   ACCORDIONS (animated <details>, re-openable mid-close)
   ===================================================================== */
$$('details.acc').forEach(d => {
  const sum = d.querySelector('summary'), body = d.querySelector('.acc__body'), chev = sum.querySelector('.chev');
  let anim;
  sum.addEventListener('click', e => {
    e.preventDefault();
    const h0 = body.offsetHeight; anim?.cancel();
    const closing = d.classList.contains('closing');
    if (d.open && !closing) {
      d.classList.add('closing'); chev.style.transform = 'rotate(0)';
      anim = body.animate([{height: h0 + 'px', opacity: 1}, {height: '0px', opacity: 0}], {duration: 380, easing: 'cubic-bezier(.65,0,.35,1)'});
      anim.onfinish = () => { d.open = false; d.classList.remove('closing'); chev.style.transform = ''; };
    } else {
      // one accordion open at a time: close the others with their own animation
      $$('details.acc[open]').forEach(o => { if (o !== d && !o.classList.contains('closing')) o.querySelector(':scope > summary').click(); });
      d.classList.remove('closing'); d.open = true; chev.style.transform = '';
      const h = body.scrollHeight;
      anim = body.animate([{height: (closing ? h0 : 0) + 'px', opacity: closing ? 1 : 0}, {height: h + 'px', opacity: 1}], {duration: 450, easing: 'cubic-bezier(.22,.8,.26,1)'});
    }
  });
});

/* =====================================================================
   GALLERY + LIGHTBOX
   ===================================================================== */
const gallery = $p('#gallery'), items = [...gallery.children];
$p('#galleryDots').innerHTML = items.map((_, i) => `<i class="${i ? '' : 'on'}"></i>`).join('');
gallery.addEventListener('scroll', () => {
  const i = Math.round(Math.abs(gallery.scrollLeft) / gallery.clientWidth);
  $$('#galleryDots i').forEach((d, k) => d.classList.toggle('on', k === i));
}, {passive: true});
const lb = $('#lightbox');
function buildLightbox() {
  $p('#lbList').innerHTML = items.map(el => el.classList.contains('trust')
    ? `<div class="lightbox__item lightbox__item--static">${el.outerHTML.replace('media-item trust', 'trust')}</div>`
    : `<div class="lightbox__item">${el.querySelector('.art')?.outerHTML.replace(' loading="lazy"', '') || ''}</div>`).join('');
}
function openLightbox(i) {
  buildLightbox();
  lb.classList.add('is-open'); lock(true); lastFocus = document.activeElement;
  const target = $$('.lightbox__item', lb)[i];
  requestAnimationFrame(() => { lb.scrollTop = target.offsetTop - 40; $('.lightbox__x').focus({preventScroll: true}); });
}
function closeLightbox() {
  lb.classList.remove('is-open');
  if (!$('.modal.is-open') && !$('.drawer.is-open')) lock(false); lastFocus?.focus?.({preventScroll: true});
}
items.forEach((el, i) => el.addEventListener('click', () => { if (!el.classList.contains('trust') || !canHover) openLightbox(i); }));
$('[data-close-lightbox]').addEventListener('click', closeLightbox);
const setOrigin = (it, e) => { const r = it.getBoundingClientRect(); it.style.setProperty('--ox', ((e.clientX - r.left) / r.width * 100) + '%'); it.style.setProperty('--oy', ((e.clientY - r.top) / r.height * 100) + '%'); };
lb.addEventListener('click', e => {
  const it = e.target.closest('.lightbox__item');
  if (!it) { if (!e.target.closest('.lightbox__x')) closeLightbox(); return; }
  if (it.classList.contains('lightbox__item--static')) return;
  setOrigin(it, e); it.classList.toggle('is-zoomed');
});
lb.addEventListener('mousemove', e => { const it = e.target.closest('.lightbox__item.is-zoomed'); if (it) setOrigin(it, e); });

/* =====================================================================
   PRODUCT GRID
   ===================================================================== */
const REC = ['althaer', 'sauvage', 'blue', 'miss', 'strong', 'homme', 'leather', 'allure-sport', 'scandal', 'libre', 'coco', 'ultra'];
let gridExpanded = false;
const ART_CACHE = {};
function syncSetSwitch() { $$('.setswitch button').forEach(b => b.classList.toggle('is-on', b.dataset.set === CARD_SET)); }
document.addEventListener('click', e => {
  const b = e.target.closest('[data-set]'); if (!b || b.dataset.set === CARD_SET) return;
  CARD_SET = b.dataset.set; store.set('cardSet', CARD_SET);
  for (const k in ART_CACHE) delete ART_CACHE[k];
  syncSetSwitch(); renderGrid(); renderCart();
  $$('#grid .card').forEach(c => c.classList.add('is-in'));
});
function card(key, i) {
  const hidden = i >= 8 && !gridExpanded;
  return pcard(key, {cls: hidden ? 'is-hidden' : '', attrs: ` data-reveal style="--i:${i % 6}"`});
}
function renderGrid() {
  syncSetSwitch();
  $p('#grid').innerHTML = REC.map(card).join('');
  $$('#grid [data-reveal]').forEach(el => revealIO.observe(el));
  const b = $p('#showMore'); b.disabled = gridExpanded; b.innerHTML = t(gridExpanded ? 'recs.all' : 'recs.more');
}
$p('#showMore').addEventListener('click', () => {
  gridExpanded = true;
  $$('#grid .card.is-hidden').forEach((c, i) => { c.classList.remove('is-hidden'); c.classList.add('is-new', 'is-in'); c.style.setProperty('--i', i); });
  const b = $p('#showMore'); b.disabled = true; b.innerHTML = t('recs.all');
});

/* =====================================================================
   CART
   ===================================================================== */
let cart = store.get('cart', []).filter(l => PRODUCTS[l.k]);
const UPSELL = ['sauvage', 'miss', 'blue'];
function cartQty() { return cart.reduce((a, l) => a + l.q, 0); }
/* tiers: free shipping at 2 items, then -10% / -15% / -20% at 3 / 4 / 5 items */
const SHIP_FEE = 25;
const TIERS = [[2, 0], [3, .1], [4, .15], [5, .2]];
const discountRate = n => n >= 5 ? .2 : n >= 4 ? .15 : n >= 3 ? .1 : 0;
const itemsLabel = n => n === 1 ? t('cart.n1') : n === 2 ? t('cart.n2') : t('cart.nn', {n});
const unit = n => t(n === 1 ? 'cart.u1' : 'cart.uN');
const TRASH = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M3.5 5.5h13M8 5.5V3.8h4v1.7M5.2 5.5l.8 11h8l.8-11M8.4 8.5v5M11.6 8.5v5"/></svg>';
const TRUCK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"><path d="M2.5 6.5h11v9h-11zM13.5 9.5h4l3 3.2v2.8h-7"/><circle cx="6.5" cy="17" r="1.8"/><circle cx="17" cy="17" r="1.8"/></svg>';
function upsell(k) {
  const p = PRODUCTS[k];
  return `<div class="upsell">${productArt(k, true)}<div><b>${esc(pname(k))}</b><a class="alt" href="#" data-toast-k="toast.compare">${t('card.alt')}</a><button class="btn" data-add="${k}">${t('btn.addPrice', {p: fmt(p.price)})}</button></div></div>`;
}
function renderTiers(n) {
  const fill = n >= 5 ? 100 : n <= 1 ? n * .45 / 4.45 * 100 : (.45 + (n - 2) + .5) / 4.45 * 100;
  const tierLbl = k => LANG === 'ar' && k === 2 ? t('cart.n2') : t('cart.tierItems', {n: k});
  const nextIdx = TIERS.findIndex(([k]) => n < k);
  $('#cartTiers').innerHTML = `<div class="tiers"><div class="tiers__track"><span class="tiers__line"></span><span class="tiers__fill" style="width:${fill}%"></span><span></span>
      ${TIERS.map(([k, d], i) => `<span class="tier${n >= k ? ' is-on' : ''}${i === nextIdx ? ' is-next' : ''}"><b>${d ? '−' + d * 100 + '%' : t('cart.tierFree')}</b>${tierLbl(k)}</span>`).join('')}</div>
      <button class="tiers__info" data-open="offerModal" aria-label="${t('a.offer')}">i</button></div>
    <div class="ship-bar${n >= 5 ? ' is-done' : ''}">${TRUCK}<span>${n < 2 ? t('cart.away', {n: 2 - n, u: unit(2 - n)}) : n < 5 ? t('cart.awayDisc', {n: 1, u: unit(1), d: Math.round(discountRate(n + 1) * 100)}) : t('cart.allIn')}</span></div>`;
}
function renderCart() {
  const n = cartQty(), body = $('#cartBody'), foot = $('#cartFoot');
  $('#cartCount').textContent = n;
  $('#cartHeadCount').textContent = n ? itemsLabel(n) : '';
  renderPromo();
  renderTiers(n);
  const rail = keys => `<p class="upsell-title">${t('cart.like')}</p><div class="urail">${keys.map(upsell).join('')}</div>`;
  if (!n) {
    body.innerHTML = `<div class="cart-empty"><h3>${t('cart.oops')}</h3><p>${t('cart.empty')}</p><span class="mascot-mini">${pip(60)}</span></div>${rail(UPSELL)}`;
    foot.innerHTML = `<a class="go-checkout" href="#recs" data-close-drawer><span>${t('cart.shopAll')}</span><span></span></a>`;
    return;
  }
  const sub = cart.reduce((a, l) => a + PRODUCTS[l.k].price * l.q, 0), rate = discountRate(n), disc = Math.round(sub * rate * 100) / 100;
  const ship = n >= 2 ? 0 : SHIP_FEE, total = Math.round((sub - disc + ship) * 100) / 100;
  const more = UPSELL.filter(k => !cart.some(l => l.k === k)).concat(REC.filter(k => !UPSELL.includes(k) && !cart.some(l => l.k === k))).slice(0, 5);
  body.innerHTML = `
    <section class="cpanel"><div class="cpanel__h"><i>1</i><h4>${t('cart.yourCart')}</h4></div>
      ${cart.map(l => { const p = PRODUCTS[l.k]; return `<div class="cline line" data-k="${l.k}">${productArt(l.k, true)}
        <div><div class="cline__top"><b>${esc(pname(l.k))}</b><span>${fmt(p.price * l.q)}</span></div>
          <p class="cline__meta">${t('p.meta')}</p>
          <div class="cline__ctrl"><div class="qty"><button data-q="-1" aria-label="${t('a.dec')}">−</button><span>${l.q}</span><button data-q="1" aria-label="${t('a.inc')}">+</button></div>
            <button class="cline__rm" data-rm aria-label="${t('a.trash')}">${TRASH}</button></div></div></div>`; }).join('')}
    </section>
    <section class="cpanel"><div class="cpanel__h"><i>2</i><h4>${t('cart.summary')}</h4></div>
      <div class="sumrow"><span>${t('cart.initial')}</span><span>${fmt(sub)}</span></div>
      <div class="sumrow${ship ? '' : ' sumrow--free'}"><span>${t('cart.shipping')}</span><span>${ship ? fmt(ship) : t('cart.free')}</span></div>
      <div class="sumrow sumrow--disc"><span>${t('cart.buyMore')}</span><span>${disc ? '−' + fmt(disc) : '0'}</span></div>
    </section>
    ${rail(more)}`;
  foot.innerHTML = `<button class="go-checkout" id="checkout"><span>${t('cart.go')}</span><span>${fmt(total)}</span></button>
    <div class="paypills"><button class="pp-apple" data-toast-k="toast.demo">Apple Pay</button><button class="pp-tabby" data-toast-k="toast.demo">tabby</button><button class="pp-tamara" data-toast-k="toast.demo">tamara</button></div>`;
}
function addToCart(k, btn) {
  const go = () => {
    const l = cart.find(x => x.k === k); l ? l.q++ : cart.push({k, q: 1});
    store.set('cart', cart); renderCart(); renderBundle();
    const c = $('#cartCount'); c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump');
    if (!$('#cartDrawer').classList.contains('is-open')) openDrawer($('#cartDrawer'));
  };
  if (btn && btn.classList.contains('btn') && !btn.closest('.drawer')) {
    if (btn.classList.contains('is-loading')) return;
    if (!btn.dataset.done) btn._label = btn.innerHTML;
    clearTimeout(btn._t); btn.classList.remove('is-done'); btn.classList.add('is-loading');
    setTimeout(() => {
      btn.classList.remove('is-loading'); btn.classList.add('is-done'); btn.dataset.done = '1'; btn.innerHTML = t('p.added'); go();
      btn._t = setTimeout(() => { btn.classList.remove('is-done'); delete btn.dataset.done; if (btn._label != null) btn.innerHTML = btn._label; labelButtons(); }, 1600);
    }, 650);
  } else go();
}
document.addEventListener('click', e => {
  const a = e.target.closest('[data-add]'); if (a) { e.preventDefault(); e.stopPropagation(); addToCart(a.dataset.add, a); return; }
  if (e.target.closest('[data-cart]')) { openDrawer($('#cartDrawer')); return; }
  const line = e.target.closest('.line');
  if (line) {
    const l = cart.find(x => x.k === line.dataset.k), q = e.target.closest('[data-q]'), rm = e.target.closest('[data-rm]');
    if (q) { l.q += +q.dataset.q; if (l.q <= 0) cart = cart.filter(x => x !== l); }
    if (rm) cart = cart.filter(x => x !== l);
    if (q || rm) { store.set('cart', cart); renderCart(); renderBundle(); }
  }
  if (e.target.closest('#checkout')) toast(t('toast.demo'));
}, true);
function labelButtons() {
  $$('[data-addprice]').forEach(b => { if (!b.dataset.done) b.innerHTML = t('btn.addPrice', {p: fmt(PRODUCTS[b.dataset.addprice].price)}); });
  if (!$p('#atc').dataset.done) $p('#atc').innerHTML = t('p.atc');
  const sb = $p('#stickyBtn'); if (!sb.dataset.done) sb.innerHTML = t('sticky.btn', {p: fmt(PRODUCTS.strong.price)});
}

/* sticky add-to-cart */
const sticky = $p('#stickyAtc');
let atcOut = false, footerVisible = false;
function updateSticky() {
  const show = atcOut && !footerVisible;
  sticky.classList.toggle('is-visible', show); sticky.setAttribute('aria-hidden', String(!show));
  $p('#stickyBtn').tabIndex = show ? 0 : -1;
  document.body.classList.toggle('has-sticky', show);
}
new IntersectionObserver(([en]) => { atcOut = !en.isIntersecting && en.boundingClientRect.top < 0; updateSticky(); }).observe($p('#atc'));
new IntersectionObserver(([en]) => { footerVisible = en.isIntersecting; updateSticky(); }).observe($p('.footer'));

/* =====================================================================
   SEARCH PANEL (popular pills, suggestions dropdown, product hits)
   ===================================================================== */
const search = $('#search'), sInput = $('#searchInput'), sScrim = $('#searchScrim'), suggest = $('#suggest');
const POPULAR = ['althaer', 'sauvage', 'blue', 'miss', 'strong', 'homme', 'leather', 'scandal', 'libre'];
let sIdx = -1;
function renderPills() { $('#pills').innerHTML = POPULAR.map((k, i) => `<button type="button" style="--i:${i}">${esc(pname(k))}</button>`).join(''); }
function openSearch() {
  closeDD(); lastFocus = document.activeElement;
  sInput.value = ''; runSearch();
  search.classList.add('is-open'); search.setAttribute('aria-hidden', 'false'); sScrim.classList.add('is-open'); lock(true);
  setTimeout(() => sInput.focus(), 120);
}
function closeSearch() {
  search.classList.remove('is-open', 'has-suggest'); search.setAttribute('aria-hidden', 'true'); sScrim.classList.remove('is-open'); suggest.hidden = true;
  if (!$('.drawer.is-open') && !$('.modal.is-open')) lock(false); lastFocus?.focus?.({preventScroll: true});
}
$$('[data-search]').forEach(b => b.addEventListener('click', openSearch));
$('[data-close-search]').addEventListener('click', closeSearch);
sScrim.addEventListener('click', closeSearch);
$('#pills').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { sInput.value = b.textContent; runSearch(); sInput.focus(); } });
$('#searchClear').addEventListener('click', () => { sInput.value = ''; runSearch(); sInput.focus(); });
function runSearch() {
  const raw = sInput.value.trim(), q = raw.toLowerCase();
  $('#searchClear').hidden = !raw; sIdx = -1;
  if (!q || !search.classList.contains('is-open') && raw) { suggest.hidden = true; suggest.innerHTML = ''; search.classList.remove('has-suggest'); return; }
  const terms = t('search.terms').split('|').filter(x => x.includes(q)).sort((a, b) => a.indexOf(q) - b.indexOf(q) || a.length - b.length).slice(0, 6);
  const hits = Object.keys(PRODUCTS).filter(k => { const p = PRODUCTS[k]; return [p.en, p.ar, p.fam, t('fam.' + p.fam), p.g, t('g.' + p.g), p.sub ? p.sub.join(' ') : ''].join(' ').toLowerCase().includes(q); }).slice(0, 4);
  const bold = s => { const i = s.indexOf(q); return i < 0 ? `<b>${esc(s)}</b>` : `<b>${esc(s.slice(0, i))}</b>${esc(s.slice(i, i + q.length))}<b>${esc(s.slice(i + q.length))}</b>`; };
  suggest.innerHTML = (terms.map(s => `<button type="button" class="suggest__item" data-term="${esc(s)}">${bold(s)}</button>`).join('') +
    (hits.length ? `<p class="suggest__head">${t('search.products')}</p>` + hits.map(k => `<a href="#recs" class="suggest__prod">${productArt(k, true)}<span><b>${esc(pname(k))}</b><small>${t('fam.' + PRODUCTS[k].fam)} · ${fmt(PRODUCTS[k].price)}</small></span></a>`).join('') : ''))
    || `<p class="no-results">${esc(t('search.none', {q: raw}))}</p>`;
  suggest.hidden = false; search.classList.add('has-suggest');
}
sInput.addEventListener('input', runSearch);
sInput.addEventListener('search', runSearch);
sInput.addEventListener('keydown', e => {
  if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
  const list = $$('.suggest__item, .suggest__prod', suggest); if (!list.length) return;
  e.preventDefault();
  const down = e.key === 'ArrowDown';
  sIdx = sIdx < 0 ? (down ? 0 : list.length - 1) : (sIdx + (down ? 1 : -1) + list.length) % list.length;
  list.forEach((x, i) => x.classList.toggle('is-active', i === sIdx)); list[sIdx].scrollIntoView({block: 'nearest'});
});
$('#searchForm').addEventListener('submit', e => {
  e.preventDefault();
  const act = $('.is-active', suggest); if (act) { act.click(); return; }
  const q = sInput.value.trim(); if (!q) return;
  closeSearch(); location.hash = 'recs'; toast(t('search.showing', {q}));
});
suggest.addEventListener('click', e => {
  const s = e.target.closest('[data-term]'); if (s) { sInput.value = s.dataset.term; runSearch(); sInput.focus(); return; }
  if (e.target.closest('.suggest__prod')) closeSearch();
});

/* =====================================================================
   MOBILE MENU
   ===================================================================== */
const mm = $('#mmenu');
const resetMM = () => { $$('.is-sub', mm).forEach(p => p.classList.remove('is-active')); $('[data-panel=root]', mm).classList.remove('is-pushed'); };
$$('[data-mmenu]').forEach(b => b.addEventListener('click', () => { resetMM(); openDrawer(mm); }));
mm.addEventListener('click', e => {
  const s = e.target.closest('[data-sub]');
  if (s) { $('[data-panel=root]', mm).classList.add('is-pushed'); $(`[data-panel=${s.dataset.sub}]`, mm).classList.add('is-active'); setTimeout(() => $(`[data-panel=${s.dataset.sub}] [data-back-panel]`, mm).focus({preventScroll: true}), 60); }
  if (e.target.closest('[data-back-panel]')) resetMM();
});

/* =====================================================================
   LOCALIZATION (country + language)
   ===================================================================== */
const COUNTRIES = [['SA', 'Saudi Arabia', 'السعودية', 'SAR'], ['AE', 'United Arab Emirates', 'الإمارات', 'AED'], ['KW', 'Kuwait', 'الكويت', 'KWD'], ['QA', 'Qatar', 'قطر', 'QAR'], ['BH', 'Bahrain', 'البحرين', 'BHD'], ['OM', 'Oman', 'عُمان', 'OMR'], ['EG', 'Egypt', 'مصر', 'EGP'], ['JO', 'Jordan', 'الأردن', 'JOD'], ['MA', 'Morocco', 'المغرب', 'MAD'], ['LB', 'Lebanon', 'لبنان', 'USD'], ['IQ', 'Iraq', 'العراق', 'IQD'], ['FR', 'France', 'فرنسا', 'EUR'], ['DE', 'Germany', 'ألمانيا', 'EUR'], ['GB', 'United Kingdom', 'المملكة المتحدة', 'GBP'], ['US', 'United States', 'الولايات المتحدة', 'USD']];
const LANGS = [['ar', 'العربية'], ['en', 'English']];
const cName = code => { const c = COUNTRIES.find(x => x[0] === code) || COUNTRIES[0]; return LANG === 'ar' ? c[2] : c[1]; };
let country = store.get('country', 'SA'), pending = {country, lang: LANG};
function renderLoc() {
  const q = $('#locSearch').value.trim().toLowerCase();
  $('#locList').innerHTML = COUNTRIES.filter(c => (c[1] + ' ' + c[2]).toLowerCase().includes(q))
    .map(c => `<button data-c="${c[0]}" class="${c[0] === pending.country ? 'is-on' : ''}"><span>${LANG === 'ar' ? c[2] : c[1]} <small style="color:var(--muted)">(${c[3]})</small></span></button>`).join('')
    || `<p style="padding:10px 14px;color:var(--muted)">${t('loc.none')}</p>`;
  $('#langList').innerHTML = LANGS.map(([k, n]) => `<button data-l="${k}" class="${k === pending.lang ? 'is-on' : ''}" lang="${k}">${n}</button>`).join('');
  $('#countrySelect').innerHTML = COUNTRIES.map(c => `<option value="${c[0]}">${LANG === 'ar' ? c[2] : c[1]}</option>`).join('');
  $('#countrySelect').value = country;
}
$('#locSearch').addEventListener('input', renderLoc);
$('#locList').addEventListener('click', e => { const b = e.target.closest('[data-c]'); if (b) { pending.country = b.dataset.c; renderLoc(); } });
$('#langList').addEventListener('click', e => { const b = e.target.closest('[data-l]'); if (b) { pending.lang = b.dataset.l; renderLoc(); } });
$('#locModal').addEventListener('modal:open', () => { pending = {country, lang: LANG}; $('#locSearch').value = ''; renderLoc(); $('#locList .is-on')?.scrollIntoView({block: 'nearest'}); });
$('#locModal').addEventListener('modal:close', () => { pending = {country, lang: LANG}; $('#locSearch').value = ''; renderLoc(); });
$('#locSave').addEventListener('click', () => {
  const next = {...pending};
  country = next.country; store.set('country', country);
  closeModal($('#locModal'));
  if (next.lang !== LANG) setLang(next.lang); else renderLoc();
  toast(t('toast.loc', {c: cName(country), l: LANGS.find(l => l[0] === LANG)[1]}));
});
$('#countrySelect').addEventListener('change', e => { country = pending.country = e.target.value; store.set('country', country); toast(t('toast.loc', {c: cName(country), l: LANGS.find(l => l[0] === LANG)[1]})); });

/* =====================================================================
   REVIEWS + Q&A
   ===================================================================== */
let rvTotal = 1284;
const REVIEWS = [
  {n: ['Kaia R.', 'ريم ع.'], rec: 1, r: 5, d: '2026-10-08', h: 12, t: ['Smells like a summer orchard', 'رائحة بستان في الصيف'], b: ['I swap between this and a woody scent depending on my mood. This one always gets compliments.', 'أبدّل بينه وبين عطر خشبي حسب مزاجي، وهذا العطر يجلب لي المديح دائماً.'], re: ['We love that you keep a rotation going, Kaia! Variety makes getting ready more fun ✨', 'يسعدنا أنك تنوّعين بين العطور يا ريم! التنوّع يجعل الاستعداد أمتع ✨']},
  {n: ['Sam T.', 'سارة ت.'], rec: 0, r: 3, d: '2026-10-07', h: 8, t: ['Nice, but soft', 'جميل لكنه ناعم'], b: ['Really pretty opening, just wish it projected a bit more after lunch.', 'افتتاحية جميلة جداً، لكن تمنيت أن يكون فوّاحاً أكثر بعد الظهر.'], re: ['Thanks for the honest note! Try a spritz on moisturised skin or on a scarf; it helps the honey heart linger 🧡', 'شكراً لصراحتك! جرّبي رشّه على بشرة مرطّبة أو على الوشاح، فهذا يطيل بقاء قلب العسل 🧡']},
  {n: ['Paula M.', 'نوف م.'], rec: 1, r: 5, d: '2026-10-06', h: 31, t: ['New signature', 'عطري المميز الجديد'], b: ['Juicy and warm at the same time. It lasts all day on me and my partner keeps asking what I am wearing. Please never discontinue it!', 'منعش ودافئ في الوقت نفسه. يدوم طوال اليوم، والكل يسألني عن اسمه. أرجوكم لا توقفوه أبداً!'], re: ['This made our day! So happy it became your signature 💛', 'أسعدتِ يومنا! يسعدنا أنه أصبح عطرك المميز 💛']},
  {n: ['Elena V.', 'لينا ف.'], rec: 1, r: 5, d: '2026-10-04', h: 19, t: ['Spot on', 'مطابق تماماً'], b: ['It smells exactly like the apricot jam my grandmother made. Instant nostalgia.', 'رائحته تماماً مثل مربى المشمش الذي كانت تصنعه جدتي. حنين فوري.'], re: ['What a sweet memory to carry around. Thanks for sharing it with us!', 'يا لها من ذكرى جميلة ترافقك. شكراً لمشاركتها معنا!']},
  {n: ['Jonah P.', 'جود ب.'], rec: 1, r: 5, d: '2026-09-28', h: 2, t: ['Beautiful', 'رائع'], b: ['Love it.', 'أحببته.'], re: null},
  {n: ['Mira K.', 'مها ك.'], rec: 1, r: 4, d: '2026-09-25', h: 14, t: ['Great value', 'قيمة ممتازة'], b: ['Sweet without being sticky. I would give 5 stars if it came in a travel size too.', 'حلو دون أن يكون ثقيلاً. سأعطيه 5 نجوم لو توفّر بحجم السفر أيضاً.'], re: ['Good news: a 10ml travel spray is on the way this winter!', 'خبر سار: عبوة سفر بحجم 10 مل قادمة هذا الشتاء!']},
  {n: ['Leo D.', 'ليث د.'], rec: 1, r: 5, d: '2026-09-20', h: 9, t: ['Unisex done right', 'عطر للجنسين بامتياز'], b: ['My wife and I share this one. On me it gets more vetiver, on her more honey. Fun.', 'نتشاركه أنا وزوجتي. عليّ يظهر نجيل الهند أكثر، وعليها يظهر العسل. ممتع.'], re: null},
  {n: ['Ines B.', 'إيناس ب.'], rec: 0, r: 2, d: '2026-09-18', h: 5, t: ['Too sweet for me', 'حلو أكثر من اللازم بالنسبة لي'], b: ['Quality is fine but the honey is a bit much for my taste. Packaging was lovely.', 'الجودة جيدة لكن العسل طاغٍ قليلاً على ذوقي. التغليف كان رائعاً.'], re: ['Sorry it wasn’t your match. Our team can help you swap for something fresher like Citrus Matcha!', 'نأسف لأنه لم يناسبك. يسعد فريقنا مساعدتك في استبداله بعطر أكثر انتعاشاً مثل ماتشا الحمضيات!']},
  {n: ['Ruth A.', 'رهف أ.'], rec: 1, r: 5, d: '2026-09-12', h: 7, t: ['Gift success', 'هدية موفّقة'], b: ['Bought it for my sister, now I need my own bottle.', 'اشتريته لأختي، والآن أحتاج زجاجتي الخاصة.'], re: null},
  {n: ['Theo F.', 'ثامر ف.'], rec: 1, r: 4, d: '2026-09-09', h: 4, t: ['Very good', 'جيد جداً'], b: ['The pear opening is gorgeous. The dry-down is soft and skin-like.', 'افتتاحية الإجاص رائعة، والختام ناعم وقريب من البشرة.'], re: null},
  {n: ['Nadia S.', 'نادية س.'], rec: 1, r: 5, d: '2026-09-03', h: 22, t: ['Obsessed', 'مدمنة عليه'], b: ['Third bottle. Enough said.', 'الزجاجة الثالثة. يكفي هذا.'], re: ['Third bottle club! Thank you 🥂', 'نادي الزجاجة الثالثة! شكراً لك 🥂']},
  {n: ['Owen C.', 'عمر ك.'], rec: 0, r: 1, d: '2026-08-30', h: 3, t: ['Arrived late', 'وصل متأخراً'], b: ['Scent is nice but delivery took two weeks.', 'العطر جميل لكن التوصيل استغرق أسبوعين.'], re: ['We’re sorry about the delay. We’ve raised it with our courier and sent you a little something for the wait.', 'نعتذر عن التأخير. رفعنا الأمر لشركة الشحن وأرسلنا لك هدية صغيرة تقديراً لصبرك.']},
];
REVIEWS.forEach((r, i) => r.id = 'r' + i);
const QA = [
  {q: ['Is this suitable for sensitive skin?', 'هل يناسب البشرة الحساسة؟'], a: ['It is vegan and free from parabens. If you have very sensitive skin, try spraying on clothing first.', 'العطر نباتي وخالٍ من البارابين. إذا كانت بشرتك حساسة جداً، جرّب رشّه على الملابس أولاً.']},
  {q: ['Is it more sweet or fruity?', 'هل هو حلو أكثر أم فاكهي؟'], a: ['Fruity first (pear, apricot), then the honey heart makes it softly sweet.', 'فاكهي في البداية (إجاص ومشمش)، ثم يمنحه قلب العسل حلاوة ناعمة.']},
  {q: ['Can I wear it to the office?', 'هل يمكنني وضعه في العمل؟'], a: ['Absolutely. It sits close to the skin after an hour and isn’t overpowering.', 'بالتأكيد. يقترب من البشرة بعد ساعة ولا يكون طاغياً.']},
];
const L = v => Array.isArray(v) ? (LANG === 'ar' ? v[1] : v[0]) : v;
const BARS = [[5, 62], [4, 20], [3, 8], [2, 5], [1, 5]];
let rvFilter = 0, rvShown = 5, rvSort = 'recent';
const voted = new Set(store.get('voted', []));
const fdate = s => { const x = new Date(s); return `${x.getDate()}/${x.getMonth() + 1}/${String(x.getFullYear()).slice(2)}`; };
function renderRvStatic() {
  $p('#rvTab').textContent = t('rv.tab', {n: num(rvTotal)});
  $p('#rvBased').textContent = t('rv.based', {n: num(rvTotal)});
  $$('.rv-total').forEach(a => a.textContent = num(rvTotal));
  $p('#rvBars').innerHTML = BARS.map(([s, p]) => `<div class="rv-bar"><span>${s}★</span><i><b data-w="${p}" style="width:${barsShown ? p : 0}%"></b></i><span>${p}%</span></div>`).join('');
  $p('#rvStars').innerHTML = [1, 2, 3, 4, 5].map(n => `<button data-r="${n}" class="${rvFilter === n ? 'is-on' : ''}" aria-label="${t('rv.starsAl', {n})}">${STAR.repeat(n)}</button>`).join('');
  $p('#rvSort').value = rvSort;
}
function renderReviews() {
  let list = REVIEWS.filter(r => !rvFilter || r.r === rvFilter);
  list = [...list].sort((a, b) => rvSort === 'high' ? b.r - a.r : rvSort === 'low' ? a.r - b.r : rvSort === 'helpful' ? (b.h + voted.has(b.id)) - (a.h + voted.has(a.id)) : b.d.localeCompare(a.d));
  $p('#rvList').innerHTML = list.slice(0, rvShown).map(r => `<div class="rv">
    <div class="rv__who"><b>${esc(L(r.n))}</b><span class="rv__ver">${r.just ? t('rv.justnow') : t('rv.verified')} <svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 0a8 8 0 100 16A8 8 0 008 0zm3.6 6L7 10.6 4.4 8l1-1L7 8.6 10.6 5z"/></svg></span>${r.rec ? `<span class="rv__rec"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="8" cy="8" r="7"/><path d="M5 8.5V12h5.5l1-4H9V5.5L7 8.5z"/></svg>${t('rv.rec')}</span>` : ''}</div>
    <div class="rv__main">
      <div class="rv__top"><span class="stars">${starsHTML(r.r)}</span><span class="rv__date">${fdate(r.d)}</span></div>
      <p class="rv__title">${esc(r.t ? L(r.t) : t('rf.defTitle'))}</p><p style="margin-top:8px">${esc(L(r.b))}</p>
      <div class="rv__helpful">${t('rv.helpful')} <button data-help="${r.id}" class="${voted.has(r.id) ? 'is-on' : ''}"><svg viewBox="0 0 16 16" fill="currentColor"><path d="M2 7h3v8H2zM6 15h6.5a1.5 1.5 0 001.5-1.2l1-5A1.5 1.5 0 0013.5 7H10V3.5A1.5 1.5 0 008.5 2L6 7z"/></svg>${r.h + (voted.has(r.id) ? 1 : 0)}</button></div>
      ${r.re ? `<div class="rv__reply"><div class="rv__top"><b>${t('rv.brand')}</b><span class="rv__date">${fdate(r.d)}</span></div><p style="margin-top:4px">${esc(L(r.re))}</p></div>` : ''}
    </div></div>`).join('') || `<p class="rv-empty">${t('rv.empty', {n: rvFilter})}</p>`;
  $p('#rvMore').hidden = list.length <= rvShown;
  if (typeof armReveal === 'function' && document.readyState !== 'loading') try { armReveal($p('#reviews')); } catch {}
}
function renderQA() { $p('#qaList').innerHTML = QA.map(x => `<div class="qa"><b>${t('qa.q')} ${esc(L(x.q))}</b>${x.a ? `<p><b>${t('rv.brand')}:</b> ${esc(L(x.a))}</p>` : `<p style="color:var(--muted)">${t('qa.wait')}</p>`}</div>`).join(''); }
$p('#rvStars').addEventListener('click', e => {
  const b = e.target.closest('[data-r]'); if (!b) return;
  const n = +b.dataset.r; rvFilter = rvFilter === n ? 0 : n; rvShown = 5;
  $$('#rvStars button').forEach(x => x.classList.toggle('is-on', +x.dataset.r === rvFilter));
  renderReviews();
});
$p('#rvSort').addEventListener('change', e => { rvSort = e.target.value; renderReviews(); });
$p('#rvMore').addEventListener('click', () => { rvShown += 5; renderReviews(); });
$p('#rvList').addEventListener('click', e => {
  const b = e.target.closest('[data-help]'); if (!b) return;
  const k = b.dataset.help; voted.has(k) ? voted.delete(k) : voted.add(k); store.set('voted', [...voted]); renderReviews();
});
$$('.rv-tabs button').forEach(tb => tb.addEventListener('click', () => {
  $$('.rv-tabs button').forEach(x => x.setAttribute('aria-selected', x === tb));
  $p('#rvPanel').hidden = tb.dataset.tab !== 'rvPanel'; $p('#qaPanel').hidden = tb.dataset.tab !== 'qaPanel';
}));
let barsShown = false;
new IntersectionObserver((en, o) => { if (en[0].isIntersecting) { barsShown = true; $$('#rvBars b').forEach(b => b.style.width = b.dataset.w + '%'); o.disconnect(); } }).observe($p('#rvBars'));

/* review / question form */
let rfMode = 'review';
function renderStarInput() { $('#rfStars').innerHTML = [5, 4, 3, 2, 1].map(n => `<input type="radio" name="rfr" id="rf${n}" value="${n}"><label for="rf${n}" aria-label="${t('rf.starsAl', {n})}">${STAR}</label>`).join(''); }
function setReviewMode(m) {
  rfMode = m; const q = m === 'question';
  $('#rfTitle').textContent = t(q ? 'rf.question' : 'rf.review');
  $('#rfStarsWrap').hidden = q; $('#rfTitleWrap').hidden = q;
  $('#rfBodyLbl').textContent = t(q ? 'rf.q' : 'rf.body');
}
$('#rForm').addEventListener('submit', e => {
  e.preventDefault();
  const name = $('#rfName').value.trim(), body = $('#rfBody').value.trim(), r = +($('input[name=rfr]:checked')?.value || 0);
  if (rfMode === 'review' && !r) return toast(t('toast.needRating'));
  if (!name || !body) return toast(t('toast.needFields'));
  if (rfMode === 'review') {
    rvTotal++;
    REVIEWS.unshift({id: 'u' + Date.now(), just: 1, n: name, rec: r >= 4 ? 1 : 0, r, d: new Date().toISOString().slice(0, 10), t: $('#rfHead').value.trim() || null, b: body, re: null, h: 0});
    rvFilter = 0; rvSort = 'recent'; rvShown = Math.max(rvShown, 5);
    renderRvStatic(); renderReviews(); toast(t('toast.rvAdded'));
  } else { QA.unshift({q: body, a: null}); renderQA(); toast(t('toast.qAdded')); }
  e.target.reset(); closeModal($('#reviewModal'));
});

/* =====================================================================
   NEWSLETTER
   ===================================================================== */
const validEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
$('#nlForm').addEventListener('submit', e => {
  e.preventDefault(); const i = e.target.querySelector('input'), m = $('#nlMsg');
  if (!validEmail(i.value)) { m.textContent = t('f.nlBad'); m.style.color = 'var(--coral-dk)'; return; }
  m.textContent = t('f.nlOk'); m.style.color = 'var(--ok)'; i.value = '';
});

/* =====================================================================
   COOKIE CONSENT → LEAD POPUP
   ===================================================================== */
const cookieDone = () => { $('#cookieFab').classList.add('is-on'); scheduleLead(); };
$('#cookieModal').addEventListener('click', e => {
  const b = e.target.closest('[data-cookie]'); if (!b) return;
  const a = b.dataset.cookie;
  if (a === 'prefs') { $('#cookieMain').hidden = true; $('#cookiePrefs').hidden = false; return; }
  if (a === 'back') { $('#cookieMain').hidden = false; $('#cookiePrefs').hidden = true; return; }
  const c = a === 'accept' ? {a: true, m: true} : a === 'decline' ? {a: false, m: false} : {a: $('#ckA').checked, m: $('#ckM').checked};
  store.set('cookies', c); $('#ckA').checked = c.a; $('#ckM').checked = c.m;
  $('#cookieMain').hidden = false; $('#cookiePrefs').hidden = true;
  closeModal($('#cookieModal')); cookieDone();
});
let leadScheduled = false;
function scheduleLead() {
  if (leadScheduled) return; leadScheduled = true;
  const st = store.get('lead', null);
  if (st === 'done') return;
  if (st === 'dismissed') { $('#leadPill').classList.add('is-on'); return; }
  setTimeout(() => {
    const busy = $('.modal.is-open') || $('.drawer.is-open') || search.classList.contains('is-open') || lb.classList.contains('is-open');
    busy ? $('#leadPill').classList.add('is-on') : openModal('leadModal');
  }, 3500);
}
$('#leadModal').addEventListener('modal:close', () => {
  if (store.get('lead') !== 'done') { store.set('lead', 'dismissed'); const p = $('#leadPill'); p.classList.add('is-on', 'is-wide'); setTimeout(() => p.classList.remove('is-wide'), 2600); }
  else $('#leadPill').classList.remove('is-on');
});
$('#leadPill').addEventListener('click', () => openModal('leadModal'));
$('#leadForm').addEventListener('submit', e => {
  e.preventDefault(); const i = $('#leadEmail');
  if (!validEmail(i.value)) { i.classList.remove('err'); void i.offsetWidth; i.classList.add('err'); i.focus(); return; }
  store.set('lead', 'done'); $('#leadStep1').hidden = true; $('#leadStep2').hidden = false; $('#copyCode').focus();
});
$('#copyCode').addEventListener('click', () => {
  const c = $('#codeTxt').textContent;
  (navigator.clipboard?.writeText(c) || Promise.reject()).then(() => toast(t('toast.copied')), () => toast(t('toast.code', {c})));
});

/* =====================================================================
   REVEAL, SEO drag, tooltip tap
   ===================================================================== */
const revealIO = new IntersectionObserver(en => en.forEach(x => { if (x.isIntersecting) { x.target.classList.add('is-in'); revealIO.unobserve(x.target); } }), {rootMargin: '0px 0px -8% 0px'});
$$('[data-reveal]').forEach(el => revealIO.observe(el));

/* Reveal rules: [selector, motion, stagger siblings?, base delay ms] */
const isMobile = () => matchMedia('(max-width:989px)').matches;
const REVEAL_RULES = [
  ['.crumbs', 'fade', false, 150],
  ['.info__head, .rating-row, .meta, .inspired, .chips, .atc', 'up', true, 150],
  ['.info > .acc', 'up', true, 0],
  ['.notes-card', 'up', false, 0],
  ['.section__title', 'up', false, 0], ['.show-more', 'up', false, 0],
  ['.rated', 'fade', false, 0],
  ['.rv-tabs, .rv-summary, .rv-filter, .rv-sort', 'up', true, 0],
  ['#rvList .rv', 'up', true, 0], ['#qaList .qa', 'up', true, 0], ['.rv-more', 'up', false, 0],
  ['.seo', 'fade', false, 0],
  ['.footer__grid > div', 'up', true, 0], ['.footer__bottom', 'fade', false, 0],
];
function armReveal(root = document) {
  $$('[data-rv]:not(.is-in)', root).forEach(el => revealIO.observe(el));
  for (const [sel, type, stagger, delay] of REVEAL_RULES) {
    const els = $$(sel, root).filter(el => !el.dataset.rv && !el.hasAttribute('data-reveal'));
    const seen = new Map();
    els.forEach(el => {
      const ty = typeof type === 'function' ? type() : type;
      el.dataset.rv = ty;
      if (stagger) { const p = el.parentElement, k = seen.get(p) || 0; el.style.setProperty('--i', Math.min(k, 12)); seen.set(p, k + 1); }
      if (delay) el.style.setProperty('--rv-delay', delay + 'ms');
      revealIO.observe(el);
    });
  }
}

/* =====================================================================
   SMOOTH SCROLL (Lenis) — inertial wheel scrolling; drawers/modals keep native scroll,
   in-page links glide to their section below the sticky top bar
   ===================================================================== */
(() => {
  if (!window.Lenis || matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  const lenis = window.__lenis = new Lenis({lerp: .09, prevent: node => !!node.closest?.('.drawer, .modal, .search, .suggest, [data-lenis-prevent]')});
  const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]'), id = a?.getAttribute('href');
    if (!id || id.length < 2 || e.defaultPrevented) return;
    const el = document.getElementById(id.slice(1)); if (!el || el.closest('.drawer, .modal')) return;
    e.preventDefault();
    lenis.scrollTo(el, {offset: -($('#topbar')?.offsetHeight || 0) - 8});
  });
})();

/* =====================================================================
   SCROLL ANIMATIONS — two-way: fade + rise in on entering, fade out on leaving
   (drifting up past the top, down past the bottom); whatever enters together cascades
   in on-screen order. [selector, motion]
   ===================================================================== */
const SA_RULES = [
  ['.hero__content > *', 'up'],
  ['.feats > .feat', 'up'],
  ['.hsec__head', 'up'],
  ['.track .pcard', 'up'],
  ['.colls > .coll', 'up'],
  ['.tops > .top', 'up'],
  ['.story', 'fade'],
  ['.bnd-head > *', 'up'],
  ['#bndGrid .pcard', 'up'],
];
const saIO = new IntersectionObserver(entries => {
  const rtl = document.documentElement.dir === 'rtl';
  const pos = x => x.boundingClientRect.top * 4 + (rtl ? -x.boundingClientRect.right : x.boundingClientRect.left);
  let k = 0;
  entries.sort((a, b) => pos(a) - pos(b)).forEach(x => {
    const el = x.target;
    if (x.isIntersecting) {
      el.style.setProperty('--sa-i', Math.min(k++, 8));
      el.classList.add('is-vis');
    } else {
      el.dataset.saOut = x.boundingClientRect.bottom < innerHeight / 2 ? 'up' : 'down';
      el.classList.remove('is-vis');
    }
  });
}, {rootMargin: '-3% 0px -3% 0px'});
function armScrollAnim() {
  if (matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  for (const [sel, type] of SA_RULES)
    $$(sel).forEach(el => {
      if (el.dataset.sa || el.dataset.rv || el.hasAttribute('data-reveal')) return;
      el.dataset.sa = type; el.dataset.saOut = 'down';
      saIO.observe(el);
    });
}
armScrollAnim();
// cards are (re)rendered by language switches, sliders and the bundle filter — pick new ones up
{
  let queued = 0;
  new MutationObserver(() => { if (!queued) queued = requestAnimationFrame(() => { queued = 0; armScrollAnim(); }); })
    .observe(document.body, {childList: true, subtree: true});
}

/* at the very bottom the reveal margin can never be crossed — reveal whatever is on screen */
addEventListener('scroll', () => {
  if (innerHeight + scrollY < document.documentElement.scrollHeight - 4) return;
  $$('[data-rv]:not(.is-in), [data-reveal]:not(.is-in)').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.top < innerHeight && r.bottom > 0) { el.classList.add('is-in'); revealIO.unobserve(el); }
  });
}, {passive: true});

/* subtle scroll parallax on gallery photos (desktop, motion allowed) */
(() => {
  if (matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  let raf = 0;
  const tick = () => {
    raf = 0; if (isMobile()) return;
    const vh = innerHeight;
    $$('.gallery .art').forEach(img => {
      const r = img.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      const p = (r.top + r.height / 2 - vh / 2) / vh;       // -1..1 around the viewport centre
      img.style.setProperty('--py', (p * -9).toFixed(1) + 'px');
    });
  };
  addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(tick); }, {passive: true});
  addEventListener('resize', tick); tick();
})();
const seo = $p('#seo'); let drag = null;
seo.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; drag = {x: e.clientX, s: seo.scrollLeft, moved: false}; seo.style.cursor = 'grabbing'; });
addEventListener('pointermove', e => { if (!drag) return; const dx = e.clientX - drag.x; if (Math.abs(dx) > 3) drag.moved = true; seo.scrollLeft = drag.s - dx; });
addEventListener('pointerup', () => { if (drag) { seo.style.cursor = ''; setTimeout(() => drag = null, 0); } });
seo.addEventListener('click', e => { if (drag?.moved) e.preventDefault(); });
$$('.chip--info').forEach(c => c.addEventListener('click', e => { e.stopPropagation(); c.classList.toggle('is-open'); }));
document.addEventListener('click', () => $$('.chip--info.is-open').forEach(c => c.classList.remove('is-open')));

/* =====================================================================
   HOMEPAGE (only runs when the homepage sections are present)
   ===================================================================== */
const HOME_STR = {
  en: {
    'home.title': 'Niche | A perfume house', 'home.new': 'NEW', 'home.heroTitle': '<b>Strong Niche:</b> a warm men’s scent with modern appeal.',
    'home.shopNew': 'Shop new drops', 'home.shopAll': 'Shop all', 'home.pause': 'Pause video', 'home.unmute': 'Unmute video',
    'home.f1': 'Crafted<br>with care', 'home.f1s': 'with love and care.', 'home.f2': 'Free<br>Returns', 'home.f2s': 'no questions asked.',
    'home.f3': '2,000,000+<br>Bottles', 'home.f3s': 'sold across the region.', 'home.f4': '100,000+<br>Reviews', 'home.f4s': 'from happy customers.',
    'home.drops': 'Our latest drops', 'home.prev': 'Previous', 'home.next': 'Next', 'home.collMen': '<b>Men’s</b> perfumes', 'home.collWomen': '<b>Women’s</b> perfumes', 'home.collUnisex': '<b>Unisex</b> perfumes',
    'home.c1': 'Niche Bundles', 'home.c1s': '4 hand-picked perfumes<br>from <b>SAR 129</b> <s>300</s>', 'home.c2': 'Build your bundle', 'home.c2s': 'Pick 3 perfumes,<br>get 3 <b>free</b>',
    'home.featured': 'Featured perfumes', 'home.viewAll': 'View all',
    'home.s1': 'The original scent…<br>for less', 'home.s1p': 'We cracked the hardest equation: perfumes inspired by<br>world-famous scents, with the quality and longevity you deserve.', 'home.s1cta': 'Shop all perfumes',
    'home.s2': 'Try Niche<br>in person', 'home.s2p': 'Visit us in Riyadh, Al-Ahsa or Al-Kharj<br>and find the scent closest to your taste.', 'home.s2list': '<li>Riyadh</li><li>Al-Ahsa</li><li>Al-Kharj</li><li>Salalah Gardens Mall <em>opening soon</em></li>', 'home.s2cta': 'Find a store',
    'promo.tag': 'Limited offer', 'promo.title': 'Buy 3, get 3 FREE', 'promo.ends': 'Ends in', 'promo.cta': 'Shop now',
    'promo.left': '<b>{n} more</b> to unlock the offer', 'promo.done': '<b>Unlocked!</b> 3 free perfumes are yours',
  },
  ar: {
    'home.title': 'نيش | دار عطور', 'home.new': 'جديد', 'home.heroTitle': '<b>سترونق نيش:</b> عطر رجالي دافئ بجاذبية عصرية.',
    'home.shopNew': 'تسوّق الجديد', 'home.shopAll': 'تسوّق الكل', 'home.pause': 'إيقاف الفيديو', 'home.unmute': 'تشغيل الصوت',
    'home.f1': 'صُنع<br>بإتقان', 'home.f1s': 'بحب وعناية.', 'home.f2': 'إرجاع<br>مجاني', 'home.f2s': 'بلا أي أسئلة.',
    'home.f3': '+2 مليون<br>زجاجة', 'home.f3s': 'بيعت في المنطقة.', 'home.f4': '+100 ألف<br>تقييم', 'home.f4s': 'من عملاء سعداء.',
    'home.drops': 'أحدث الإصدارات', 'home.prev': 'السابق', 'home.next': 'التالي', 'home.collMen': 'عطور <b>رجالية</b>', 'home.collWomen': 'عطور <b>نسائية</b>', 'home.collUnisex': 'عطور <b>للجنسين</b>',
    'home.c1': 'باقات نيش', 'home.c1s': '4 عطور مختارة<br>من <b>129 ر.س</b> <s>300</s>', 'home.c2': 'كوّن باقتك', 'home.c2s': 'اختر 3 عطور<br>واحصل على 3 <b>مجاناً</b>',
    'home.featured': 'عطور مختارة', 'home.viewAll': 'عرض الكل',
    'home.s1': 'ريحة الأصل…<br>بس أوفر', 'home.s1p': 'حققنا المعادلة الأصعب: عطور مستوحاة من روائح عالمية،<br>بجودة وثبات يليق بذوقك.', 'home.s1cta': 'تسوّق كل العطور',
    'home.s2': 'جرّب نيش<br>على الطبيعة', 'home.s2p': 'زورنا في الرياض أو الأحساء أو الخرج،<br>واكتشف العطر الأقرب لذوقك.', 'home.s2list': '<li>الرياض</li><li>الأحساء</li><li>الخرج</li><li>صلالة جاردنز مول <em>قريبًا</em></li>', 'home.s2cta': 'مواقع الفروع',
    'promo.tag': 'عرض محدود', 'promo.title': 'اشترِ 3 واحصل على 3 مجاناً', 'promo.ends': 'ينتهي خلال', 'promo.cta': 'تسوّق الآن',
    'promo.left': 'متبقي <b>{n}</b> للحصول على العرض', 'promo.done': '<b>مبروك!</b> حصلت على 3 عطور مجاناً',
  },
};
Object.assign(I18N.en, HOME_STR.en);
Object.assign(I18N.ar, HOME_STR.ar);

// tall "latest drops" cards: placeholder imagery until the designer's portrait shots land in assets/home/
// [product, image, eyebrow [en, ar]] — image defaults to the product shot
const DROPS = [
  ['strong', 'assets/home/drop-strong-niche.webp', ['Huda Al Hajj', 'هدى الحاج']], ['althaer', IMG('althaer')],
  ['scandal', IMG('scandal')], ['sauvage', IMG('sauvage')],
  ['miss', IMG('miss')], ['blue', IMG('blue')],
  ['libre', IMG('libre')], ['leather', IMG('leather')],
];
const FEATURED = ['sauvage', 'miss', 'blue', 'scandal', 'homme', 'coco', 'leather', 'libre'];
const collOf = k => t('home.coll' + PRODUCTS[k].g);

/* promo strip: "buy 3 get 3 free" — cart progress, countdown to midnight, collapses while scrolling down */
const MINI_BOTTLE = '<svg viewBox="140 80 232 352" fill="none"><rect x="168" y="88" width="176" height="106" rx="14" fill="currentColor"/><rect x="149" y="213" width="214" height="211" rx="24" stroke="currentColor" stroke-width="22"/><rect x="149" y="246" width="214" height="146" fill="currentColor"/></svg>';
function renderPromo() {
  const slots = $('#promoSlots'); if (!slots) return;
  const n = Math.min(cartQty(), 3);
  slots.innerHTML = Array.from({length: 6}, (_, i) => `<i class="${i < 3 ? (i < n ? 'is-on' : '') : 'is-gift' + (n >= 3 ? ' is-on' : '')}">${MINI_BOTTLE}</i>`).join('');
  $('#promoLeft').innerHTML = t(n >= 3 ? 'promo.done' : 'promo.left', {n: 3 - n});
  $('#promo').classList.toggle('is-done', n >= 3);
}
(() => {
  const promo = $('#promo'), clock = $('#promoClock'); if (!promo) return;
  const pad = v => String(Math.floor(v)).padStart(2, '0');
  const tick = () => {
    const now = new Date(), end = new Date(now); end.setHours(24, 0, 0, 0);
    const s = Math.floor((end - now) / 1000);
    clock.innerHTML = [s / 3600, s / 60 % 60, s % 60].map(v => `<b>${pad(v)}</b>`).join('<i>:</i>');
  };
  tick(); setInterval(tick, 1000);
  // full top bar height (header + expanded strip), so the hero fits the first screen; measured from the inner bar, so collapsing on scroll does not resize the hero
  const bar = $('.promo__bar', promo), header = $('#header');
  // written in the next frame and only on change, so the observers never loop
  let topH = '', fitQ = 0;
  const fit = () => {
    const v = bar.offsetHeight + header.offsetHeight + 'px';
    if (v !== topH) document.documentElement.style.setProperty('--top-h', topH = v);
  };
  const ro = new ResizeObserver(() => { if (!fitQ) fitQ = requestAnimationFrame(() => { fitQ = 0; fit(); }); });
  ro.observe(bar); ro.observe(header);
  fit();
  let lastY = scrollY;
  addEventListener('scroll', () => {
    const y = scrollY;
    if (Math.abs(y - lastY) < 6) return;
    promo.classList.toggle('is-hidden', y > lastY && y > 120);
    lastY = y;
  }, {passive: true});
})();

function renderHome() {
  if (!onPage('#dropsTrack')) return;
  $('#dropsTrack').innerHTML = DROPS.map(([k, img, tag]) => pcard(k, {img, tag})).join('');
  $('#featTrack').innerHTML = FEATURED.map(k => pcard(k)).join('');
  $$('[data-mark]').forEach(el => el.innerHTML = MARK);
  $$('.track').forEach(makeSlider);
  buildTrackNav(); heroControls();
  syncArrows();
}

/* carousels: looping transform slider like the reference (flex rail, translateX 0.3s ease,
   one card per step, endless in both directions, drag follows the pointer) */
const SLIDE_EASE = 'transform .3s cubic-bezier(.4,0,.2,1)';
function makeSlider(tr) {
  if (tr._slider) { tr._slider.rewrap(); return tr._slider; }
  let rail;
  const wrap = () => {
    rail = tr.querySelector(':scope > .rail');
    if (!rail) { rail = document.createElement('div'); rail.className = 'rail'; rail.append(...tr.children); tr.append(rail); }
    [...rail.children].forEach((c, k) => { if (c.dataset.slide == null) c.dataset.slide = k; });
    if (!rail._te) { rail._te = true; rail.addEventListener('transitionend', e => { if (e.target === rail && e.propertyName === 'transform') settle(); }); }
  };
  wrap();
  // u = offset in "reading direction" px: 0 at rest, negative = moved towards the next card
  const s = {i: 0, u: 0, busy: false, pending: 0};
  const sign = () => getComputedStyle(tr).direction === 'rtl' ? -1 : 1;
  const step = () => { const c = rail.firstElementChild; return c ? c.getBoundingClientRect().width + (parseFloat(getComputedStyle(rail).columnGap) || 0) : 0; };
  const count = () => rail.children.length;
  const set = (u, anim) => { s.u = u; rail.style.transition = anim ? SLIDE_EASE : 'none'; rail.style.transform = `translate3d(${u * sign()}px,0,0)`; };
  // move a card from one end to the other and compensate the offset so nothing visibly jumps
  const rotate = dir => {
    if (dir > 0) { rail.append(rail.firstElementChild); s.u += step(); }
    else { rail.prepend(rail.lastElementChild); s.u -= step(); }
    set(s.u, false);
  };
  const logical = () => +rail.firstElementChild.dataset.slide;
  const settle = () => {                     // after an animation: normalise back to offset 0
    clearTimeout(s.guard);
    const st = step(); if (!st) { set(0, false); s.busy = false; return; }
    while (s.u <= -st / 2) rotate(1);
    while (s.u > st / 2) rotate(-1);
    set(0, false); s.busy = false; s.i = logical(); sync();
    if (s.pending) { const one = Math.sign(s.pending); s.pending -= one; s.go(one); }   // play queued clicks one card at a time
  };
  s.go = delta => {
    if (!delta) return;
    if (s.busy) { s.pending += delta; return; }     // queue fast clicks instead of dropping them
    const st = step(); if (!st || count() < 2) return;
    s.busy = true;
    if (delta < 0) { for (let k = 0; k < -delta; k++) rotate(-1); void rail.offsetWidth; set(0, true); }
    else set(-delta * st, true);
    clearTimeout(s.guard); s.guard = setTimeout(() => s.busy && settle(), 450);   // transitionend can be lost (resize, tab switch)
    if (matchMedia('(prefers-reduced-motion:reduce)').matches) settle();
  };
  s.layout = () => { if (!s.busy) set(0, false); };
  s.rewrap = () => { const fresh = !tr.querySelector(':scope > .rail'); wrap(); if (fresh) { s.i = 0; s.busy = false; s.pending = 0; set(0, false); } sync(); };
  const sync = () => {
    $$(`.track-nav[data-for="#${tr.id}"] .track-nav__dots i`).forEach((d, k) => d.classList.toggle('on', k === s.i));
    $$(`.arrow[data-scroll="#${tr.id}"]`).forEach(b => b.disabled = false);
  };
  // drag (mouse + touch); vertical touch scrolling still scrolls the page
  let d = null;
  tr.addEventListener('pointerdown', e => {
    if (e.button || s.busy) return;
    d = {x: e.clientX, y: e.clientY, start: 0, dx: 0, moved: false, id: e.pointerId, t: performance.now()};
  });
  addEventListener('pointermove', e => {
    if (!d || e.pointerId !== d.id) return;
    d.dx = e.clientX - d.x;
    if (!d.moved) {
      if (Math.abs(e.clientY - d.y) > Math.abs(d.dx) && Math.abs(e.clientY - d.y) > 6) { d = null; return; }
      if (Math.abs(d.dx) < 6) return;
      d.moved = true; tr.classList.add('is-dragging');
    }
    const st = step();
    let u = d.start + d.dx * sign();
    while (u > 0) { rotate(-1); d.start -= st; u -= st; }      // pulling back: bring the previous card in
    while (u < -st) { rotate(1); d.start += st; u += st; }     // pulling forward past a whole card
    set(u, false);
  }, {passive: true});
  const end = () => {
    if (!d) return;
    const m = d; d = null;
    if (!m.moved) return;
    tr.classList.remove('is-dragging');
    const st = step(), dirNext = m.dx * sign() < 0;
    const fast = Math.abs(m.dx) / Math.max(1, performance.now() - m.t) > .35;
    let k = Math.round(-s.u / st);                               // 0 = settle on the card at 0, 1 = advance
    if (fast) k = dirNext ? 1 : 0;
    s.busy = true;
    const target = -k * st;
    if (Math.abs(target - s.u) < 1) { set(target, false); settle(); }
    else { set(target, true); clearTimeout(s.guard); s.guard = setTimeout(() => s.busy && settle(), 450); }
    tr._justDragged = true; setTimeout(() => tr._justDragged = false, 0);
  };
  addEventListener('pointerup', end);
  addEventListener('pointercancel', end);
  tr.addEventListener('click', e => { if (tr._justDragged) { e.preventDefault(); e.stopPropagation(); } }, true);
  tr.addEventListener('dragstart', e => e.preventDefault());
  tr._slider = s;
  set(0, false); sync();
  return s;
}
function syncArrows() { $$('.track').forEach(tr => tr._slider && tr._slider.layout()); }
function slideTrack(tr, dir) { (tr._slider || makeSlider(tr)).go(dir); }
document.addEventListener('click', e => {
  const b = e.target.closest('.arrow[data-scroll]'); if (!b) return;
  const tr = $(b.dataset.scroll); if (!tr) return;
  slideTrack(tr, +b.dataset.dir);
});
addEventListener('resize', syncArrows);
new MutationObserver(syncArrows).observe(document.documentElement, {attributes: true, attributeFilter: ['dir']});

/* brand-story slider: slides (not fades), draggable with mouse and touch, arrows, dots, autoplay paused on hover */
(() => {
  const box = $('.story'), track = $('#storySlides'); if (!box || !track) return;
  const slides = $$('.story__slide', track), dots = $('#storyDots');
  let i = 0, timer;
  dots.innerHTML = slides.map((_, k) => `<i class="${k ? '' : 'on'}"></i>`).join('');
  const dirx = () => document.documentElement.dir === 'rtl' ? -1 : 1;
  const place = (px = 0, anim = true) => {
    track.style.transition = anim ? 'transform .8s cubic-bezier(.65,0,.35,1)' : 'none';
    track.style.transform = `translateX(calc(${-i * 100 * dirx()}% + ${px}px))`;
  };
  const go = n => { i = (n + slides.length) % slides.length; place(); $$('i', dots).forEach((d, k) => d.classList.toggle('on', k === i)); };
  const play = () => { clearInterval(timer); timer = setInterval(() => go(i + 1), 6000); };
  $$('[data-story]').forEach(b => b.addEventListener('click', () => { go(i + +b.dataset.story); play(); }));
  box.addEventListener('mouseenter', () => clearInterval(timer));
  box.addEventListener('mouseleave', play);
  // drag / swipe
  let d = null;
  track.addEventListener('pointerdown', e => { if (e.button) return; d = {x: e.clientX, y: e.clientY, dx: 0, moved: false, id: e.pointerId}; clearInterval(timer); });
  addEventListener('pointermove', e => {
    if (!d || e.pointerId !== d.id) return;
    d.dx = e.clientX - d.x;
    if (!d.moved && Math.abs(d.dx) > 6 && Math.abs(d.dx) > Math.abs(e.clientY - d.y)) { d.moved = true; box.classList.add('is-dragging'); }
    if (d.moved) place(d.dx, false);
  });
  const end = () => {
    if (!d) return;
    const m = d; d = null; box.classList.remove('is-dragging');
    if (m.moved && Math.abs(m.dx) > box.clientWidth * .12) go(i - Math.sign(m.dx) * dirx()); else place();
    if (m.moved) { box._justDragged = true; setTimeout(() => box._justDragged = false, 0); }
    play();
  };
  addEventListener('pointerup', end);
  addEventListener('pointercancel', end);
  box.addEventListener('click', e => { if (box._justDragged) { e.preventDefault(); e.stopPropagation(); } }, true);
  box.addEventListener('dragstart', e => e.preventDefault());
  addEventListener('resize', () => place(0, false));
  // language switch flips direction: re-place without animation
  new MutationObserver(() => place(0, false)).observe(document.documentElement, {attributes: true, attributeFilter: ['dir']});
  place(0, false); play();
})();

/* hero video: shown only when a source is set (assets/home/hero.mp4); pause + mute toggles */
(() => {
  const v = $('video[data-hero-video]'); if (!v) return;
  const src = document.body.dataset.heroVideo; if (!src) return;
  v.src = src; v.hidden = false; $('.hero__img').hidden = true;
  v.play().catch(() => {});
})();

/* =====================================================================
   BUNDLE BUILDER (only runs on the bundle page; shares the cart state)
   ===================================================================== */
Object.assign(I18N.en, {
  'bnd.pageTitle': 'Make a bundle | Niche', 'bnd.title': 'Bundle.', 'bnd.lead': 'Pick 3 or more perfumes and the savings grow with every one you add.',
  'bnd.summary': 'Price summary', 'bnd.initial': 'Initial price', 'bnd.subtotal': 'Subtotal', 'bnd.checkout': 'Checkout',
  'bnd.hintNext': 'Add {n} more {u} for {d}% off', 'bnd.hintFree': 'Add {n} more {u} for free shipping', 'bnd.hintMax': 'You’ve unlocked the maximum 20% off',
  'bnd.off': '{d}% OFF', 'bnd.freeShip': 'Free shipping', 'bnd.all': 'All perfumes', 'bnd.best': 'Bestsellers', 'bnd.add': 'Add to bundle', 'bnd.added': 'In bundle ✓',
  'bnd.none': 'No perfumes match your search.', 'bnd.remove': 'Remove {p}', 'bnd.empty': 'Add at least one perfume to check out',
});
Object.assign(I18N.ar, {
  'bnd.pageTitle': 'كوّن باقتك | نيش', 'bnd.title': 'باقتك.', 'bnd.lead': 'اختر 3 عطور أو أكثر، وكلما أضفت أكثر زاد التوفير.',
  'bnd.summary': 'ملخص السعر', 'bnd.initial': 'السعر الأولي', 'bnd.subtotal': 'المجموع الفرعي', 'bnd.checkout': 'إتمام الشراء',
  'bnd.hintNext': 'أضف {n} {u} لتحصل على خصم {d}%', 'bnd.hintFree': 'أضف {n} {u} لتحصل على شحن مجاني', 'bnd.hintMax': 'حصلت على أقصى خصم 20%',
  'bnd.off': 'خصم {d}%', 'bnd.freeShip': 'شحن مجاني', 'bnd.all': 'كل العطور', 'bnd.best': 'الأكثر مبيعاً', 'bnd.add': 'أضف إلى الباقة', 'bnd.added': 'في الباقة ✓',
  'bnd.none': 'لا توجد عطور تطابق بحثك.', 'bnd.remove': 'إزالة {p}', 'bnd.empty': 'أضف عطراً واحداً على الأقل لإتمام الشراء',
});

const BND_ORDER = ['althaer', 'sauvage', 'blue', 'miss', 'strong', 'homme', 'leather', 'allure-sport', 'scandal', 'libre', 'coco', 'ultra'];
let bndFilter = 'all';
const CHECK = '<svg viewBox="0 0 12 12" fill="currentColor"><circle cx="6" cy="6" r="6"/><path d="M3.2 6.2l1.8 1.7 3.8-3.8" stroke="#fff" stroke-width="1.3" fill="none"/></svg>';

/* one entry per bottle, in the order they were added */
const bundleItems = () => cart.flatMap(l => Array.from({length: l.q}, () => l.k));

function annTiers(n) {
  if (!onPage('#bundle')) return;
  const box = $('.ann__inner');
  let el = $('.ann-tiers', box);
  if (!el) { $('#annTrack').hidden = true; el = document.createElement('div'); el.className = 'ann-tiers'; box.appendChild(el); }
  const fill = n >= 5 ? 100 : n <= 1 ? n * .45 / 4.45 * 100 : (.45 + (n - 2) + .5) / 4.45 * 100;
  const nextIdx = TIERS.findIndex(([k]) => n < k);
  el.innerHTML = `<div class="tiers__track"><span class="tiers__line"></span><span class="tiers__fill" style="width:${fill}%"></span><span></span>
    ${TIERS.map(([k, d], i) => `<span class="tier${n >= k ? ' is-on' : ''}${i === nextIdx ? ' is-next' : ''}"><b>${d ? '−' + d * 100 + '%' : t('cart.tierFree')}</b>${LANG === 'ar' && k === 2 ? t('cart.n2') : t('cart.tierItems', {n: k})}</span>`).join('')}</div>
    <button class="tiers__info" data-open="offerModal" aria-label="${t('a.offer')}">i</button>`;
}

function renderBundle() {
  if (!onPage('#bundle')) return;
  const items = bundleItems(), n = items.length;
  annTiers(n);
  // slots: filled bottles, then discount tiers still to reach, then open "+" slots
  const total = Math.max(12, n + 4);
  $('#bndSlots').innerHTML = Array.from({length: total}, (_, i) => {
    const k = items[i], pos = i + 1;
    if (k) return `<div class="slot slot--filled"><div class="slot__box"><img src="${IMG(k)}" alt=""><button type="button" class="slot__x" data-unbundle="${k}" aria-label="${esc(t('bnd.remove', {p: pname(k)}))}">×</button></div>
      <span class="slot__name">${esc(pname(k))}</span>${pos === 2 ? `<span class="slot__ship">${CHECK}${t('bnd.freeShip')}</span>` : ''}</div>`;
    const tier = TIERS.find(([q, d]) => q === pos && d);
    return `<div class="slot"><div class="slot__box">${tier ? `<b>${t('bnd.off', {d: tier[1] * 100})}</b><i>${pos}</i>` : `<span class="plus">+</span><i>${pos}</i>`}</div></div>`;
  }).join('');
  syncSlotScroll();

  const sub = cart.reduce((a, l) => a + PRODUCTS[l.k].price * l.q, 0), rate = discountRate(n), disc = Math.round(sub * rate * 100) / 100;
  const after = Math.round((sub - disc) * 100) / 100;
  $('#bndInitial').textContent = fmt(sub);
  $('#bndDiscRow').hidden = !disc;
  $('#bndDiscLbl').textContent = t('cart.disc', {d: rate * 100});
  $('#bndDisc').textContent = '−' + fmt(disc);
  $('#bndSubtotal').textContent = fmt(after);
  $('#bndSumTotal').textContent = fmt(after);
  $('#bndHint').textContent = n >= 5 ? t('bnd.hintMax') : n < 2 ? t('bnd.hintFree', {n: 2 - n, u: unit(2 - n)}) : t('bnd.hintNext', {n: 1, u: unit(1), d: Math.round(discountRate(n + 1) * 100)});
  $('#bndCheckout').disabled = !n;

  // product grid: price shown at the discount the shopper reaches by adding one more
  const q = $('#bndSearch').value.trim().toLowerCase();
  const best = new Set([...BND_ORDER].sort((a, b) => PRODUCTS[b].count - PRODUCTS[a].count).slice(0, 6));
  const keys = BND_ORDER.filter(k => (bndFilter === 'all' || best.has(k)) && (!q || [PRODUCTS[k].en, PRODUCTS[k].ar].join(' ').toLowerCase().includes(q)));
  const nextRate = discountRate(n + 1);
  const priceHTML = p => { const v = Math.round(p.price * (1 - nextRate) * 100) / 100; return (nextRate ? `<s>${fmt(p.price)}</s>` : '') + fmt(v) + (nextRate ? `<em>−${nextRate * 100}%</em>` : ''); };
  // same filter/search/language as last render: patch prices + buttons in place (no re-animation)
  const key = [bndFilter, q, LANG].join('|');
  if (key === renderBundle.key && $$('#bndGrid .pcard').length === keys.length) {
    $$('#bndGrid .pcard').forEach(card => {
      const btn = card.querySelector('[data-bundle]'), k = btn.dataset.bundle, inB = items.includes(k);
      card.querySelector('.pcard__price').innerHTML = priceHTML(PRODUCTS[k]);
      btn.classList.toggle('is-in', inB); btn.textContent = t(inB ? 'bnd.added' : 'bnd.add');
    });
    return;
  }
  renderBundle.key = key;
  $('#bndGrid').innerHTML = keys.map(k => pcard(k, {bundle: {inB: items.includes(k), price: priceHTML(PRODUCTS[k])}})).join('');
  $('#bndEmpty').hidden = keys.length > 0;
}

/* slot row: scroll-position bar + prev/next arrows that hide at the ends */
function syncSlotScroll() {
  const sl = $p('#bndSlots'), bar = $p('#bndBar'); if (!sl.scrollWidth) return;
  const max = sl.scrollWidth - sl.clientWidth, pos = Math.abs(sl.scrollLeft);
  const w = sl.clientWidth / sl.scrollWidth * 100, left = max ? pos / max * (100 - w) : 0;
  bar.style.width = w + '%'; bar.style.insetInlineStart = left + '%';
  $$('[data-slot-dir]').forEach(b => b.hidden = +b.dataset.slotDir < 0 ? pos < 4 : pos > max - 4);
}
document.addEventListener('scroll', e => { if (e.target.id === 'bndSlots') syncSlotScroll(); }, true);
addEventListener('resize', () => onPage('#bundle') && syncSlotScroll());
document.addEventListener('click', e => {
  const b = e.target.closest('[data-slot-dir]'); if (!b) return;
  const sl = $('#bndSlots'), rtl = getComputedStyle(sl).direction === 'rtl';
  sl.scrollBy({left: +b.dataset.slotDir * 106 * 3 * (rtl ? -1 : 1), behavior: 'smooth'});
});
function bundleAdd(k) { const l = cart.find(x => x.k === k); l ? l.q++ : cart.push({k, q: 1}); bundleSave(); }
function bundleRemove(k) { const l = cart.find(x => x.k === k); if (!l) return; l.q--; if (l.q <= 0) cart = cart.filter(x => x !== l); bundleSave(); }
function bundleSave() {
  store.set('cart', cart); renderCart(); renderBundle();
  const c = $('#cartCount'); c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump');
  const sl = $('#bndSlots'); sl.scrollTo({left: (getComputedStyle(sl).direction === 'rtl' ? -1 : 1) * Math.max(0, bundleItems().length - 3) * 106, behavior: 'smooth'});
}

document.addEventListener('click', e => {
  if (!onPage('#bundle')) return;
  const add = e.target.closest('[data-bundle]'); if (add) { bundleAdd(add.dataset.bundle); return; }
  const rm = e.target.closest('[data-unbundle]'); if (rm) { bundleRemove(rm.dataset.unbundle); return; }
  const f = e.target.closest('[data-filter]');
  if (f) { bndFilter = f.dataset.filter; $$('[data-filter]').forEach(b => b.classList.toggle('is-on', b === f)); renderBundle(); return; }
  if (e.target.closest('#bndCheckout')) { openDrawer($('#cartDrawer')); return; }
  const tg = e.target.closest('#bndSumToggle');
  if (tg) { const open = tg.getAttribute('aria-expanded') !== 'true'; tg.setAttribute('aria-expanded', open); $('.bnd-sum').classList.toggle('is-open', open); }
});
document.addEventListener('input', e => { if (e.target.id === 'bndSearch') renderBundle(); });

/* ---- homepage round 2: labelled arrows, eased carousel slide, dots, hero controls ---- */
Object.assign(I18N.en, {'home.shopViva': 'Shop bundles', 'home.shopLa': 'Start your bundle', 'home.shopWomen': 'Shop women', 'home.shopMen': 'Shop men', 'home.shopUnisex': 'Shop unisex', 'home.shop': 'Shop', 'home.play': 'Play video', 'home.mute': 'Mute video'});
Object.assign(I18N.ar, {'home.shopViva': 'تسوّق الباقات', 'home.shopLa': 'ابدأ باقتك', 'home.shopWomen': 'تسوّق للنساء', 'home.shopMen': 'تسوّق للرجال', 'home.shopUnisex': 'تسوّق للجنسين', 'home.shop': 'تسوّق', 'home.play': 'تشغيل الفيديو', 'home.mute': 'كتم الصوت'});

/* dots + arrows under each carousel (shown on mobile) */
function buildTrackNav() {
  $$('.track-nav').forEach(nav => {
    const tr = $(nav.dataset.for); if (!tr) return;
    const pages = Math.max(1, (tr.querySelector(':scope > .rail') || tr).children.length);
    nav.innerHTML = `<button type="button" class="arrow" data-scroll="${nav.dataset.for}" data-dir="-1" aria-label="${t('home.prev')}"><svg class="flip" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M10 3L5 8l5 5"/></svg></button>
      <span class="track-nav__dots">${Array.from({length: pages}, (_, i) => `<i class="${i ? '' : 'on'}"></i>`).join('')}</span>
      <button type="button" class="arrow" data-scroll="${nav.dataset.for}" data-dir="1" aria-label="${t('home.next')}"><svg class="flip" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 3l5 5-5 5"/></svg></button>`;
  });
  syncDots();
}
function syncDots() { syncArrows(); }


/* hero: play/pause + mute toggles always present; they drive the video once one is set */
function heroControls() {
  const play = $('[data-hero-play]'), mute = $('[data-hero-mute]'); if (!play) return;
  const v = $('video[data-hero-video]');
  const PAUSE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="12" cy="12" r="10"/><path d="M10 8.5v7M14 8.5v7"/></svg>';
  const PLAY = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="12" cy="12" r="10"/><path d="M10 8.5l6 3.5-6 3.5z"/></svg>';
  const MUTED = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/></svg>';
  const SOUND = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M16 9a4.5 4.5 0 010 6M18.5 6.5a8 8 0 010 11"/></svg>';
  const st = heroControls.st ||= {playing: true, muted: true};
  if (v && v.src) { st.playing = !v.paused; st.muted = v.muted; }
  let {playing, muted} = st;
  const paint = () => {
    play.innerHTML = playing ? PAUSE : PLAY; play.setAttribute('aria-label', t(playing ? 'home.pause' : 'home.play'));
    mute.innerHTML = muted ? MUTED : SOUND; mute.setAttribute('aria-label', t(muted ? 'home.unmute' : 'home.mute'));
  };
  play.onclick = () => { playing = st.playing = !playing; if (v && v.src) playing ? v.play().catch(() => {}) : v.pause(); paint(); };
  mute.onclick = () => { muted = st.muted = !muted; if (v) v.muted = muted; paint(); };
  paint();
}

/* =====================================================================
   LANGUAGE APPLY — static strings + every dynamic section
   ===================================================================== */
const NOTE_IMG = new Set(['banana', 'cocoa', 'blossom', 'macadamia', 'ylang', 'vanilla']);
function applyStatic() {
  document.documentElement.lang = LANG;
  document.documentElement.dir = LANG === 'ar' ? 'rtl' : 'ltr';
  document.title = t(onPage('#dropsTrack') ? 'home.title' : onPage('#bundle') ? 'bnd.pageTitle' : 'meta.title');
  $$('[data-i]').forEach(el => { if (!el.dataset.done) el.innerHTML = t(el.dataset.i); });
  $$('[data-i-ph]').forEach(el => el.placeholder = t(el.dataset.iPh));
  $$('[data-i-al]').forEach(el => el.setAttribute('aria-label', t(el.dataset.iAl)));
  $$('button[data-media]').forEach((el, i) => el.setAttribute('aria-label', t('a.openImg', {n: i + 1})));
  $$('[data-pname]').forEach(el => el.textContent = pname(el.dataset.pname));
  $$('[data-price]').forEach(el => { const p = PRODUCTS[el.dataset.price]; el.innerHTML = fmt(p.price) + (p.compare ? ` <s>${fmt(p.compare)}</s>` : ''); });
  $$('[data-trust]').forEach(el => el.src = `assets/gallery/trust-${LANG}.webp`);
  $$('[data-mark]').forEach(el => el.innerHTML = MARK);
  $p('#inspired').innerHTML = t('p.inspired', {p: esc(L(PRODUCTS.strong.insp))});
  $('#rights').textContent = t('legal.rights', {y: new Date().getFullYear()});
  $('#locLabel').textContent = LANG === 'ar' ? 'ع' : 'EN';
  $p('#seo').setAttribute('aria-label', t('disc.fams'));
  $p('#seo').innerHTML = t('seo').split('|').map(s => `<a href="#">${s}</a>`).join('');
  $('#offerList').innerHTML = TIERS.filter(([, d]) => d).map(([n, d]) => `<li>${t('offer.n', {n})} <b>${t('offer.off', {d: d * 100})}</b></li>`).join('');
  $p('#notes').innerHTML = [['banana', 'banana', .9], ['cocoa', 'cocoa', .9], ['flower', 'blossom', .95], ['macadamia', 'macadamia', 1], ['ylang', 'ylang', .95], ['vanilla', 'vanilla', .5]]
    .map(([k, n, s]) => `<div class="note">${NOTE_IMG.has(n) ? `<img src="assets/notes/${n}.webp" alt="" width="60" height="60" loading="lazy">` : svg(shape(k, 0, 0, s), '-40 -40 80 80', '')}${t('note.' + n)}</div>`).join('');
}
function renderAll() {
  applyStatic(); labelButtons(); renderFlavors(); renderPills(); renderGrid(); renderCart(); renderLoc();
  renderRvStatic(); renderReviews(); renderQA(); renderStarInput(); setReviewMode(rfMode);
  if (search.classList.contains('is-open')) runSearch();
  renderHome(); renderBundle();
  armReveal();
}
function setLang(l) { LANG = l; store.set('lang', l); renderAll(); }

/* =====================================================================
   BOOT
   ===================================================================== */
setFlavor(flavor);
renderAll();
const ck = store.get('cookies', null);
if (ck) { $('#ckA').checked = ck.a; $('#ckM').checked = ck.m; cookieDone(); } else setTimeout(() => openModal('cookieModal'), 900);
})();
