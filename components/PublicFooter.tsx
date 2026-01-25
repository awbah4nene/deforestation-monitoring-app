import Link from "next/link";

export default function PublicFooter() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="w-full px-8 md:px-12 lg:px-16 py-12">
        <div className="max-w-[1920px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {/* About */}
            <div className="animate-fadeInUp">
              <div className="flex items-center space-x-3 mb-5 group">
                <span className="text-4xl transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-12">🌳</span>
                <div>
                  <span className="text-xl font-bold text-white transition-colors duration-300 group-hover:text-green-400">
                    SL Forest Monitor
                  </span>
                </div>
              </div>
              <p className="text-base text-gray-400 leading-relaxed">
                AI-powered deforestation monitoring and early warning system for
                Northern Sierra Leone's sustainable forest management.
              </p>
            </div>

            {/* Quick Links */}
            <div className="animate-fadeInUp" style={{animationDelay: '0.1s'}}>
              <h3 className="text-white font-semibold mb-5 text-xl">Quick Links</h3>
              <ul className="space-y-2.5">
                <li>
                  <Link
                    href="/"
                    className="text-base hover:text-green-400 transition-all duration-300 hover:translate-x-2 inline-block"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="text-base hover:text-green-400 transition-all duration-300 hover:translate-x-2 inline-block"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/features"
                    className="text-base hover:text-green-400 transition-all duration-300 hover:translate-x-2 inline-block"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-base hover:text-green-400 transition-all duration-300 hover:translate-x-2 inline-block"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div className="animate-fadeInUp" style={{animationDelay: '0.2s'}}>
              <h3 className="text-white font-semibold mb-5 text-xl">Resources</h3>
              <ul className="space-y-2.5">
                <li>
                  <Link
                    href="/auth/login"
                    className="text-base hover:text-green-400 transition-all duration-300 hover:translate-x-2 inline-block"
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    href="/auth/register"
                    className="text-base hover:text-green-400 transition-all duration-300 hover:translate-x-2 inline-block"
                  >
                    Register
                  </Link>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-base hover:text-green-400 transition-all duration-300 hover:translate-x-2 inline-block"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-base hover:text-green-400 transition-all duration-300 hover:translate-x-2 inline-block"
                  >
                    API Reference
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="animate-fadeInUp" style={{animationDelay: '0.3s'}}>
              <h3 className="text-white font-semibold mb-5 text-xl">Contact</h3>
              <ul className="space-y-2.5">
                <li className="text-base flex items-center gap-2.5 transition-all duration-300 hover:translate-x-2">
                  <svg
                    className="w-5 h-5 transition-transform duration-300 hover:scale-110"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  info@slforestmonitor.sl
                </li>
                <li className="text-base flex items-center gap-2.5 transition-all duration-300 hover:translate-x-2">
                  <svg
                    className="w-5 h-5 transition-transform duration-300 hover:scale-110"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  +232 XX XXX XXXX
                </li>
                <li className="text-base flex items-center gap-2.5 transition-all duration-300 hover:translate-x-2">
                  <svg
                    className="w-5 h-5 transition-transform duration-300 hover:scale-110"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Freetown, Sierra Leone
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-10 pt-8 border-t border-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-base text-gray-400">
                © {new Date().getFullYear()} SL Forest Monitor. All rights
                reserved.
              </p>
              <div className="flex space-x-6 mt-5 md:mt-0">
                <a href="#" className="text-gray-400 hover:text-green-400 transition-all duration-300 transform hover:scale-125 hover:-translate-y-1">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-green-400 transition-all duration-300 transform hover:scale-125 hover:-translate-y-1">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-green-400 transition-all duration-300 transform hover:scale-125 hover:-translate-y-1">
                  <span className="sr-only">GitHub</span>
                  <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
