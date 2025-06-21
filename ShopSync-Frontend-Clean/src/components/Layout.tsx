import { ReactNode } from "react";
import { Navbar } from "./Navbar";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-metallic-100 via-white to-metallic-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors">
      <Navbar />
      <main className="flex-1">{children}</main>
      <footer className="bg-metallic-900 dark:bg-slate-950 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">ShopSync</h3>
              <p className="text-metallic-300 text-sm">
                Your premier destination for high-quality products with seamless
                shopping experience.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Quick Links</h4>
              <ul className="space-y-2 text-sm text-metallic-300">
                <li>
                  <a
                    href="/products"
                    className="hover:text-white transition-colors"
                  >
                    Products
                  </a>
                </li>
                <li>
                  <a
                    href="/categories"
                    className="hover:text-white transition-colors"
                  >
                    Categories
                  </a>
                </li>
                <li>
                  <a
                    href="/brands"
                    className="hover:text-white transition-colors"
                  >
                    Brands
                  </a>
                </li>
                <li>
                  <a
                    href="/contact"
                    className="hover:text-white transition-colors"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Customer Service</h4>
              <ul className="space-y-2 text-sm text-metallic-300">
                <li>
                  <a
                    href="/support"
                    className="hover:text-white transition-colors"
                  >
                    Support
                  </a>
                </li>
                <li>
                  <a
                    href="/shipping"
                    className="hover:text-white transition-colors"
                  >
                    Shipping Info
                  </a>
                </li>
                <li>
                  <a
                    href="/returns"
                    className="hover:text-white transition-colors"
                  >
                    Returns
                  </a>
                </li>
                <li>
                  <a href="/faq" className="hover:text-white transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Connect</h4>
              <ul className="space-y-2 text-sm text-metallic-300">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Newsletter
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Social Media
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="/privacy"
                    className="hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-metallic-700 text-center text-sm text-metallic-300">
            <p>&copy; 2024 ShopSync. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
