import Link from "next/link"

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-6 py-16">
        {/* Header */}
        <h1 className="text-center text-4xl font-bold text-black mb-12">Privacy Policy</h1>

        {/* Dates */}
        <div className="mb-8 space-y-1">
          <p className="text-sm text-black">
            <span className="font-semibold">Effective Date:</span> 8-12-2025
          </p>
          <p className="text-sm text-black">
            <span className="font-semibold">Last Updated:</span> 7-12-2025
          </p>
        </div>

        {/* Section 1 */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-black mb-3">1. Scope and Compliance</h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            This Privacy Policy describes how [Company Name] ("We," "Us," or "Our") collects, uses, and retains data generated through the use of our Warm Lead Sourcer tool (the "Service"). Our practices are guided by principles of data minimization and transparency, specifically considering global privacy regulations (e.g., GDPR, CCPA).
          </p>
        </div>

        {/* Section 2 */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-black mb-3">2. The Data We Source (Public-Only Policy)</h2>
          <p className="text-sm text-gray-700 leading-relaxed mb-4">
            We adhere to a strict public-only data sourcing policy. We only collect data that is publicly accessible and explicitly provided by the user on third-party social media and content platforms based on the public post URL provided by our client.
          </p>
          
          <p className="text-sm font-semibold text-black mb-2">2.1 Types of Public Data Sourced:</p>
          <p className="text-sm text-gray-700 leading-relaxed mb-3">
            The data we source is limited to publicly accessible information, which may include:
          </p>
          
          <ul className="space-y-2 ml-4">
            <li className="text-sm text-gray-700 leading-relaxed">
              <span className="font-semibold">• Public Identity Information:</span> Publicly available names, usernames, profile URLs, and job titles/company names (if explicitly posted in a public profile).
            </li>
            <li className="text-sm text-gray-700 leading-relaxed">
              <span className="font-semibold">• Public Activity Data:</span> Information related to public user interactions, such as publicly posted reactions (likes, hearts) and comments on the specified public post URL.
            </li>
            <li className="text-sm text-gray-700 leading-relaxed">
              <span className="font-semibold">• Public Contact Information:</span> Business contact details (e.g., publicly listed business emails) only when available on a public profile.
            </li>
          </ul>

          <p className="text-sm font-semibold text-black mt-4 mb-2">2.2 Data We Are Not to Collect:</p>
          <p className="text-sm text-gray-700 leading-relaxed">
            We strictly adhere to platform Terms of Service and do not access, scrape, or process any information that is private, protected, or requires user login or authentication, including private messages or information behind a login wall.
          </p>
        </div>

        {/* Section 3 */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-black mb-3">3. Data Storage and Retention</h2>
          
          <p className="text-sm font-semibold text-black mb-2">3.1 Encrypted, Temporary PII Storage</p>
          <p className="text-sm text-gray-700 leading-relaxed mb-4">
            All extracted Personally Identifiable Information (PII) is stored temporarily in a secure, encrypted database solely for the purpose of compiling and delivering the requested lead list to you.
          </p>

          <p className="text-sm font-semibold text-black mb-2">3.2 30-Day Automatic Deletion</p>
          <p className="text-sm text-gray-700 leading-relaxed">
            We strictly adhere to data minimization principles. All individual PII records extracted by the Service are automatically and permanently purged (deleted) from our internal database 30 days after the initial extraction date.
          </p>
        </div>

        {/* Section 4 */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-black mb-3">4. How We Use the Data</h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            The data is used only to compile a structured, enriched lead list for the client who initiated the sourcing request. We do not use this sourced data for our own marketing or share it with other third parties outside of the necessary service providers (e.g., hosting).
          </p>
        </div>

        {/* Section 5 */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-black mb-3">5. Client Responsibility (Data Controller Status)</h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            Upon downloading the compiled lead list (CSV/XLSX), the client (you) assumes the role of Data Controller for the data. The client is responsible for ensuring their subsequent storage, processing, and use of that data complies with all applicable privacy laws (GDPR, CCPA, etc.).
          </p>
        </div>

        {/* Section 6 */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-black mb-3">6. Data Subject Rights</h2>
          <p className="text-sm text-gray-700 leading-relaxed mb-3">
            Individuals whose public data was processed by the Service have the right to request access, rectification, or erasure of their data from our temporary records.
          </p>
          <p className="text-sm text-gray-700 leading-relaxed">
            To submit a request for data access or deletion (Right to Erasure), please contact our Compliance Officer directly at:
          </p>
          <p className="text-sm text-gray-700 leading-relaxed mt-2">
            Email: [compliance@yourcompanyname.com] Address: [Your Full Company Address]
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-purple-200 px-6 py-12">
        <div className="mx-auto flex max-w-7xl items-start justify-between">
          <div className="flex items-center gap-2">
            <svg width="76" height="47" viewBox="0 0 76 47" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-12 w-auto">
              <path d="M1.52227 47.0001L0 43.9556L18.2673 34.0608L32.3483 40.3402L69.0732 19.2186L66.9801 15.2227L75.9235 17.1255L73.2595 26.0689L70.4052 22.2632L32.5386 44.1459L18.2673 37.8665L1.52227 47.0001Z" fill="black"/>
              <path d="M23.0242 31.9678L18.2673 29.6846L1.71265 39.1982V31.207C1.71265 31.207 1.87057 29.7403 2.09351 28.9229C2.20501 28.5142 2.39499 28.0385 2.55737 27.665L2.85425 27.0205C3.91989 25.0224 5.50083 22.4683 8.40796 21.1152C6.2077 19.6828 4.75761 17.2384 4.75757 14.4619C4.75757 10.0481 8.42037 6.46982 12.9392 6.46973C17.4581 6.46973 21.1218 10.0481 21.1218 14.4619C21.1218 17.2027 19.7082 19.6199 17.5554 21.0596C20.3412 22.296 21.8423 24.6567 23.0242 27.0205V31.9678Z" fill="#B785FF"/>
              <path d="M44.3359 28.9233L32.1582 35.9634L23.0244 31.9683V27.02C23.0281 26.9958 23.185 25.969 23.4053 25.3081C23.6282 24.6393 24.166 23.5952 24.166 23.5952C25.218 21.6227 26.7718 19.1076 29.6084 17.7417C27.6895 16.2472 26.4493 13.8859 26.4492 11.2271C26.4492 6.70814 30.0276 3.04444 34.4414 3.04443C38.8552 3.04443 42.4336 6.70813 42.4336 11.2271C42.4335 13.9171 41.1646 16.3031 39.207 17.7944C41.7766 19.0672 43.2031 21.3295 44.3359 23.5952V28.9233Z" fill="#B785FF"/>
              <path d="M58.0365 21.1221L44.3363 28.9229V23.7861C44.3363 23.7861 44.9577 21.7026 45.4779 20.5508C45.9981 19.399 47.0004 17.8867 47.0004 17.8867C47.7934 16.7914 48.9295 15.4216 50.8949 14.5537C48.7718 13.11 47.3813 10.7105 47.3812 7.99219C47.3812 3.57844 51.0441 0.000124469 55.5629 0C60.0818 0 63.7455 3.57836 63.7455 7.99219C63.7454 10.7463 62.3184 13.1743 60.1478 14.6113C61.8744 15.4161 62.9067 16.651 63.7455 17.8867L58.0365 21.1221Z" fill="#B785FF"/>
            </svg>
            <div>
              <div className="text-lg font-bold leading-tight text-black">Warm leads</div>
              <div className="text-lg font-bold leading-tight text-black">Sourcer</div>
            </div>
          </div>
          <div className="flex flex-col gap-3 text-right text-sm text-black">
            <Link href="/" className="hover:underline">
              Homepage
            </Link>
            <Link href="/privacy-policy" className="hover:underline">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
