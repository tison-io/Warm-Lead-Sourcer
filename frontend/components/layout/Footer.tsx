import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-purple-100 to-purple-50 dark:from-gray-900 dark:to-slate-950 px-4 sm:px-6 py-12 sm:py-16 border-t border-purple-200 dark:border-gray-800 transition-colors">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 group">
              <svg width="76" height="47" viewBox="0 0 76 47" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-8 w-auto transition-transform group-hover:scale-105">
                <path d="M1.52227 47.0001L0 43.9556L18.2673 34.0608L32.3483 40.3402L69.0732 19.2186L66.9801 15.2227L75.9235 17.1255L73.2595 26.0689L70.4052 22.2632L32.5386 44.1459L18.2673 37.8665L1.52227 47.0001Z" fill="currentColor" className="text-slate-800 dark:text-slate-100"/>
                <path d="M23.0242 31.9678L18.2673 29.6846L1.71265 39.1982V31.207C1.71265 31.207 1.87057 29.7403 2.09351 28.9229C2.20501 28.5142 2.39499 28.0385 2.55737 27.665L2.85425 27.0205C3.91989 25.0224 5.50083 22.4683 8.40796 21.1152C6.2077 19.6828 4.75761 17.2384 4.75757 14.4619C4.75757 10.0481 8.42037 6.46982 12.9392 6.46973C17.4581 6.46973 21.1218 10.0481 21.1218 14.4619C21.1218 17.2027 19.7082 19.6199 17.5554 21.0596C20.3412 22.296 21.8423 24.6567 23.0242 27.0205V31.9678Z" fill="#A960FF"/>
                <path d="M44.3359 28.9233L32.1582 35.9634L23.0244 31.9683V27.02C23.0281 26.9958 23.185 25.969 23.4053 25.3081C23.6282 24.6393 24.166 23.5952 24.166 23.5952C25.218 21.6227 26.7718 19.1076 29.6084 17.7417C27.6895 16.2472 26.4493 13.8859 26.4492 11.2271C26.4492 6.70814 30.0276 3.04444 34.4414 3.04443C38.8552 3.04443 42.4336 6.70813 42.4336 11.2271C42.4335 13.9171 41.1646 16.3031 39.207 17.7944C41.7766 19.0672 43.2031 21.3295 44.3359 23.5952V28.9233Z" fill="#8300DD"/>
                <path d="M58.0365 21.1221L44.3363 28.9229V23.7861C44.3363 23.7861 44.9577 21.7026 45.4779 20.5508C45.9981 19.399 47.0004 17.8867 47.0004 17.8867C47.7934 16.7914 48.9295 15.4216 50.8949 14.5537C48.7718 13.11 47.3813 10.7105 47.3812 7.99219C47.3812 3.57844 51.0441 0.000124469 55.5629 0C60.0818 0 63.7455 3.57836 63.7455 7.99219C63.7454 10.7463 62.3184 13.1743 60.1478 14.6113C61.8744 15.4161 62.9067 16.651 63.7455 17.8867L58.0365 21.1221Z" fill="#4B0082"/>
              </svg>
              <div>
                <div className="text-sm font-bold leading-tight bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">Warm leads</div>
                <div className="text-sm font-bold leading-tight bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">Sourcer</div>
              </div>
            </Link>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Turn social engagement into warm leads instantly with AI-powered data enrichment.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Product</h3>
            <ul className="space-y-3">
              <li><Link href="/#how-it-works" className="text-sm text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">How it Works</Link></li>
              <li><Link href="/#use-cases" className="text-sm text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Use Cases</Link></li>
              <li><Link href="/signup" className="text-sm text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Pricing</Link></li>
              <li><Link href="/signup" className="text-sm text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Features</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Company</h3>
            <ul className="space-y-3">
              <li><Link href="/" className="text-sm text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">About Us</Link></li>
              <li><Link href="/privacy-policy" className="text-sm text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/#compliance" className="text-sm text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Terms of Service</Link></li>
              <li><Link href="mailto:contact@warmleadsourcer.com" className="text-sm text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Get in Touch</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href="mailto:support@warmleadsourcer.com" className="text-sm text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">support@warmleadsourcer.com</a>
              </li>

            </ul>
            
            {/* Social Links */}
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Follow Us</h4>
              <div className="flex gap-3">
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-purple-100 dark:bg-slate-800 flex items-center justify-center text-purple-600 dark:text-purple-400 hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 transition-all">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-purple-100 dark:bg-slate-800 flex items-center justify-center text-purple-600 dark:text-purple-400 hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 transition-all">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-purple-100 dark:bg-slate-800 flex items-center justify-center text-purple-600 dark:text-purple-400 hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 transition-all">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-purple-200 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              © {new Date().getFullYear()} Warm Lead Sourcer. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="/privacy-policy" className="text-sm text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Privacy</Link>
              <Link href="/#compliance" className="text-sm text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Terms</Link>
              <Link href="/#compliance" className="text-sm text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}