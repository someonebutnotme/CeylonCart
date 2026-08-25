const BRAND = "#2e7d52";

export default function Footer() {
  return (
    <footer className="bg-[#111d16] text-gray-400 mt-8">
      {/* main grid */}
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        {/* brand */}
        <div className="col-span-2 md:col-span-1">
          <span className="font-[DM_Serif_Display,serif] text-2xl text-white tracking-tight">CeylonCart</span>
          <p className="text-xs leading-relaxed mt-3 mb-4 text-gray-500">
            Sri Lanka's trusted online marketplace. Shop from thousands of local and international sellers.
          </p>
          <div className="flex gap-3">
            {[
              { label: "FB", path: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" },
              { label: "IG", path: "M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z M4 6a2 2 0 100-4 2 2 0 000 4z" },
              { label: "TW", path: "M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" },
            ].map(({ label, path }) => (
              <a key={label} href="#"
                className="w-8 h-8 rounded-full border border-gray-700 flex items-center justify-center hover:border-[#2e7d52] hover:text-white transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path d={path} />
                </svg>
              </a>
            ))}
          </div>
        </div>

        {/* customer service */}
        <div>
          <h4 className="text-white text-sm font-semibold mb-4">Customer Service</h4>
          <ul className="space-y-2.5 text-xs">
            {["Help Centre", "Track My Order", "Returns & Refunds", "Report a Problem", "Contact Us"].map((item) => (
              <li key={item}>
                <a href="#" className="hover:text-white transition-colors">{item}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* company */}
        <div>
          <h4 className="text-white text-sm font-semibold mb-4">Company</h4>
          <ul className="space-y-2.5 text-xs">
            {["About CeylonCart", "Careers", "Blog & News", "Seller Centre", "Advertise with Us"].map((item) => (
              <li key={item}>
                <a href="#" className="hover:text-white transition-colors">{item}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* legal + payment */}
        <div>
          <h4 className="text-white text-sm font-semibold mb-4">Legal</h4>
          <ul className="space-y-2.5 text-xs mb-6">
            {[
              { label: "Privacy Policy", href: "#" },
              { label: "Terms of Service", href: "#" },
              { label: "Cookie Policy", href: "#" },
              { label: "Sitemap", href: "#" },
            ].map(({ label, href }) => (
              <li key={label}>
                <a href={href} className="hover:text-white transition-colors">{label}</a>
              </li>
            ))}
          </ul>
          <h4 className="text-white text-sm font-semibold mb-3">We Accept</h4>
          <div className="flex flex-wrap gap-2">
            {["Visa", "MC", "PayPal", "Cash"].map((method) => (
              <span key={method} className="bg-gray-800 text-gray-300 text-[10px] font-bold px-2 py-1 rounded border border-gray-700">
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-600">
          <p>© 2026 CeylonCart (Pvt) Ltd. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <span className="text-gray-700">·</span>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <span className="text-gray-700">·</span>
            <a href="#" className="hover:text-white transition-colors">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
