"use client"

import Link from "next/link"

export default function Dashboard() {
  const leads = [
    {
      name: "Joseph Amani",
      linkedinUrl: "linkedin.canvafx...",
      role: "Teacher",
      university: "Kenyatta",
      email: "jmani@gmail.com",
      location: "Thika",
      score: 78,
    },
    {
      name: "Mary Alice",
      linkedinUrl: "View profile",
      role: "View profile",
      university: "View profile",
      email: "View profile",
      location: "View profile",
      score: "~",
    },
    {
      name: "Bella Akoth",
      linkedinUrl: "linkedin.canvafx...",
      role: "Physician",
      university: "Nairobi",
      email: "bella@gmail.com",
      location: "Parklands",
      score: 84,
    },
    {
      name: "Alex Cato",
      linkedinUrl: "View profile",
      role: "View profile",
      university: "View profile",
      email: "View profile",
      location: "View profile",
      score: "~",
    },
  ]

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <aside className="w-64 bg-purple-100 p-4">
        <div className="mb-8 text-center">
          <div className="w-20 h-20 rounded-full bg-purple-300 mx-auto mb-2 overflow-hidden">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="35" r="18" fill="#8B5CF6"/>
              <circle cx="50" cy="75" r="30" fill="#8B5CF6"/>
            </svg>
          </div>
          <p className="font-semibold text-black">Joyce Monroe</p>
        </div>

        <nav className="space-y-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2 bg-white rounded-lg text-purple-600 font-bold">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="3" width="7" height="7" fill="currentColor"/>
              <rect x="14" y="3" width="7" height="7" fill="currentColor"/>
              <rect x="3" y="14" width="7" height="7" fill="currentColor"/>
              <rect x="14" y="14" width="7" height="7" fill="currentColor"/>
            </svg>
            Dashboard
          </Link>

          <Link href="/" className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-white font-bold">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Home
          </Link>

          <Link href="/input-url" className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-white font-bold">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
              <path d="M9 9H15M9 13H15M9 17H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Input Page
          </Link>

          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-white font-bold">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 3H5C3.89543 3 3 3.89543 3 5V9C3 10.1046 3.89543 11 5 11H9C10.1046 11 11 10.1046 11 9V5C11 3.89543 10.1046 3 9 3Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M19 3H15C13.8954 3 13 3.89543 13 5V9C13 10.1046 13.8954 11 15 11H19C20.1046 11 21 10.1046 21 9V5C21 3.89543 20.1046 3 19 3Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M9 13H5C3.89543 13 3 13.8954 3 15V19C3 20.1046 3.89543 21 5 21H9C10.1046 21 11 20.1046 11 19V15C11 13.8954 10.1046 13 9 13Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M19 13H15C13.8954 13 13 13.8954 13 15V19C13 20.1046 13.8954 21 15 21H19C20.1046 21 21 20.1046 21 19V15C21 13.8954 20.1046 13 19 13Z" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Results Page
          </Link>

          <Link href="/privacy-policy" className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-white font-bold">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Privacy policy
          </Link>

          <Link href="/" className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-white font-bold">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Legal notice
          </Link>
        </nav>

        <button className="flex items-center gap-3 px-4 py-2 mt-8 text-gray-700 hover:text-black">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Log Out
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <header className="border-b border-gray-200 px-6 py-4">
        <nav className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
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

          <div className="flex items-center gap-6">
            <Link href="/" className="text-sm text-gray-700 hover:text-black">
              Home
            </Link>
            <Link href="/#how-it-works" className="text-sm text-gray-700 hover:text-black">
              How it works
            </Link>
            <Link href="/#use-cases" className="text-sm text-gray-700 hover:text-black">
              Use Cases
            </Link>
            <Link href="/#compliance" className="text-sm text-gray-700 hover:text-black">
              Legal
            </Link>
            <Link href="/privacy-policy" className="text-sm text-gray-700 hover:text-black">
              Privacy
            </Link>
          </div>
        </nav>
      </header>

      {/* Dashboard Content */}
      <main className="p-6">
        {/* Results Header */}
        <div className="mb-4">
          <h1 className="text-lg text-gray-700 mb-4">
            Results from <span className="text-purple-600">linkedin.com/posts/12345...</span>
          </h1>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-purple-100 rounded-2xl p-4 text-center">
              <svg className="w-16 h-14 mx-auto mb-3" viewBox="0 0 65 53" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M42.69 46.32C44.61 47.045 47.005 47.5 50 47.5C52.99 47.5 55.385 47.05 57.3 46.325C64.99 43.415 64.99 36.125 64.99 36.125C64.99 32.74 62.245 30 58.865 30H41.125C37.74 30 35 32.74 35 36.125C35 36.125 35 43.41 42.69 46.325" fill="url(#paint0_linear_235_361)"/>
                <path d="M42.69 46.32C44.61 47.045 47.005 47.5 50 47.5C52.99 47.5 55.385 47.05 57.3 46.325C64.99 43.415 64.99 36.125 64.99 36.125C64.99 32.74 62.245 30 58.865 30H41.125C37.74 30 35 32.74 35 36.125C35 36.125 35 43.41 42.69 46.325" fill="url(#paint1_radial_235_361)" fillOpacity="0.5"/>
                <path d="M40 37.5C40 35.5109 39.2098 33.6032 37.8033 32.1967C36.3968 30.7902 34.4891 30 32.5 30H7.5C5.51088 30 3.60322 30.7902 2.1967 32.1967C0.790177 33.6032 0 35.5109 0 37.5V37.875C0 37.875 0 52.5 20 52.5C39.06 52.5 39.955 39.22 40 37.97V37.5Z" fill="url(#paint2_linear_235_361)"/>
                <path d="M40 37.5C40 35.5109 39.2098 33.6032 37.8033 32.1967C36.3968 30.7902 34.4891 30 32.5 30H7.5C5.51088 30 3.60322 30.7902 2.1967 32.1967C0.790177 33.6032 0 35.5109 0 37.5V37.875C0 37.875 0 52.5 20 52.5C39.06 52.5 39.955 39.22 40 37.97V37.5Z" fill="url(#paint3_linear_235_361)"/>
                <path d="M50 25C52.6522 25 55.1957 23.9464 57.0711 22.0711C58.9464 20.1957 60 17.6522 60 15C60 12.3478 58.9464 9.8043 57.0711 7.92893C55.1957 6.05357 52.6522 5 50 5C47.3478 5 44.8043 6.05357 42.9289 7.92893C41.0536 9.8043 40 12.3478 40 15C40 17.6522 41.0536 20.1957 42.9289 22.0711C44.8043 23.9464 47.3478 25 50 25Z" fill="url(#paint4_linear_235_361)"/>
                <path d="M32.5 12.5C32.5 15.8152 31.183 18.9946 28.8388 21.3388C26.4946 23.683 23.3152 25 20 25C16.6848 25 13.5054 23.683 11.1612 21.3388C8.81696 18.9946 7.5 15.8152 7.5 12.5C7.5 9.18479 8.81696 6.00537 11.1612 3.66117C13.5054 1.31696 16.6848 0 20 0C23.3152 0 26.4946 1.31696 28.8388 3.66117C31.183 6.00537 32.5 9.18479 32.5 12.5Z" fill="url(#paint5_linear_235_361)"/>
                <defs>
                  <linearGradient id="paint0_linear_235_361" x1="42.13" y1="32.325" x2="48.525" y2="49.815" gradientUnits="userSpaceOnUse">
                    <stop offset="0.125" stopColor="#9C6CFE"/>
                    <stop offset="1" stopColor="#7A41DC"/>
                  </linearGradient>
                  <radialGradient id="paint1_radial_235_361" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(31.2 38.75) rotate(-7.36814) scale(19.9003 20.6207)">
                    <stop offset="0.392" stopColor="#3B148A"/>
                    <stop offset="1" stopColor="#3B148A" stopOpacity="0"/>
                  </radialGradient>
                  <linearGradient id="paint2_linear_235_361" x1="9.51" y1="32.99" x2="17.5" y2="55.67" gradientUnits="userSpaceOnUse">
                    <stop offset="0.125" stopColor="#BD96FF"/>
                    <stop offset="1" stopColor="#9C6CFE"/>
                  </linearGradient>
                  <linearGradient id="paint3_linear_235_361" x1="20" y1="27.32" x2="31.25" y2="64.695" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#885EDB" stopOpacity="0"/>
                    <stop offset="1" stopColor="#E362F8"/>
                  </linearGradient>
                  <linearGradient id="paint4_linear_235_361" x1="44.755" y1="7.66" x2="54.95" y2="23.935" gradientUnits="userSpaceOnUse">
                    <stop offset="0.125" stopColor="#9C6CFE"/>
                    <stop offset="1" stopColor="#7A41DC"/>
                  </linearGradient>
                  <linearGradient id="paint5_linear_235_361" x1="13.445" y1="3.325" x2="26.185" y2="23.67" gradientUnits="userSpaceOnUse">
                    <stop offset="0.125" stopColor="#BD96FF"/>
                    <stop offset="1" stopColor="#9C6CFE"/>
                  </linearGradient>
                </defs>
              </svg>
              <p className="text-lg font-bold text-black">200 TOTAL ENGAGEMENTS</p>
            </div>

            <div className="bg-purple-100 rounded-2xl p-4 text-center">
              <svg className="w-20 h-20 mx-auto mb-3" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M80 40C80 62.0914 62.0914 80 40 80C17.9086 80 0 62.0914 0 40C0 17.9086 17.9086 0 40 0C62.0914 0 80 17.9086 80 40ZM8 40C8 57.6731 22.3269 72 40 72C57.6731 72 72 57.6731 72 40C72 22.3269 57.6731 8 40 8C22.3269 8 8 22.3269 8 40Z" fill="#F5F5F5"/>
                <path d="M40 0C47.3769 8.79686e-08 54.6101 2.03998 60.8999 5.89439C67.1898 9.74881 72.2912 15.2675 75.6403 21.8404C78.9893 28.4132 80.4555 35.7842 79.8767 43.1384C79.2979 50.4925 76.6967 57.5434 72.3607 63.5114C68.0247 69.4794 62.1227 74.1322 55.3073 76.9552C48.492 79.7782 41.0287 80.6615 33.7426 79.5075C26.4566 78.3535 19.6315 75.2072 14.0221 70.4162C8.41265 65.6253 4.23733 59.3765 1.95774 52.3607L9.56619 49.8885C11.3899 55.5012 14.7301 60.5003 19.2177 64.333C23.7052 68.1657 29.1652 70.6828 34.9941 71.606C40.823 72.5292 46.7936 71.8226 52.2459 69.5641C57.6982 67.3057 62.4197 63.5836 65.8885 58.8091C69.3574 54.0347 71.4383 48.394 71.9014 42.5107C72.3644 36.6274 71.1914 30.7306 68.5122 25.4723C65.833 20.214 61.7518 15.799 56.72 12.7155C51.6881 9.63198 45.9015 8 40 8V0Z" fill="url(#paint0_linear_235_489)"/>
                <defs>
                  <linearGradient id="paint0_linear_235_489" x1="-1.34671e-07" y1="40.3809" x2="80" y2="40.3809" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#EC4899"/>
                    <stop offset="0.526042" stopColor="#A855F7"/>
                    <stop offset="1" stopColor="#3B82F6"/>
                  </linearGradient>
                </defs>
              </svg>
              <p className="text-lg font-bold text-black">40 FILTERED HITS</p>
            </div>

            <div className="bg-purple-100 rounded-2xl p-4 text-center">
              <svg className="w-16 h-18 mx-auto mb-3" viewBox="0 0 60 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6.66667V0H40V6.66667H20ZM26.6667 43.3333H33.3333V23.3333H26.6667V43.3333ZM30 70C25.8889 70 22.0133 69.2089 18.3733 67.6267C14.7333 66.0444 11.5533 63.8911 8.83333 61.1667C6.11333 58.4422 3.96111 55.2611 2.37667 51.6233C0.792222 47.9856 0 44.1111 0 40C0 35.8889 0.792222 32.0133 2.37667 28.3733C3.96111 24.7333 6.11333 21.5533 8.83333 18.8333C11.5533 16.1133 14.7344 13.9611 18.3767 12.3767C22.0189 10.7922 25.8933 10 30 10C33.4444 10 36.75 10.5556 39.9167 11.6667C43.0833 12.7778 46.0556 14.3889 48.8333 16.5L53.5 11.8333L58.1667 16.5L53.5 21.1667C55.6111 23.9444 57.2222 26.9167 58.3333 30.0833C59.4444 33.25 60 36.5556 60 40C60 44.1111 59.2078 47.9867 57.6233 51.6267C56.0389 55.2667 53.8867 58.4467 51.1667 61.1667C48.4467 63.8867 45.2656 66.04 41.6233 67.6267C37.9811 69.2133 34.1067 70.0044 30 70ZM30 63.3333C36.4444 63.3333 41.9444 61.0556 46.5 56.5C51.0556 51.9444 53.3333 46.4444 53.3333 40C53.3333 33.5556 51.0556 28.0556 46.5 23.5C41.9444 18.9444 36.4444 16.6667 30 16.6667C23.5556 16.6667 18.0556 18.9444 13.5 23.5C8.94444 28.0556 6.66667 33.5556 6.66667 40C6.66667 46.4444 8.94444 51.9444 13.5 56.5C18.0556 61.0556 23.5556 63.3333 30 63.3333Z" fill="#A0616A"/>
              </svg>
              <p className="text-lg font-bold text-black">1 min 34 sec</p>
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div className="border border-purple-200 rounded-xl overflow-hidden mb-4">
          <table className="w-full">
            <thead>
              <tr className="bg-white border-b border-purple-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-black">NAME</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-black">LINKEDIN URL</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-black">ROLE</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-black">UNIVERSITY</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-black">GUESSED EMAIL</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-black">LOCATION</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-black">SCORE</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead, index) => (
                <tr key={index} className="border-b border-purple-200 hover:bg-purple-50">
                  <td className="px-4 py-2 text-xs text-black">{lead.name}</td>
                  <td className="px-4 py-2 text-xs">
                    {lead.linkedinUrl === "View profile" ? (
                      <span className="text-red-500 cursor-pointer">{lead.linkedinUrl}</span>
                    ) : (
                      <span className="text-purple-600">{lead.linkedinUrl}</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-xs">
                    {lead.role === "View profile" ? (
                      <span className="text-red-500 cursor-pointer">{lead.role}</span>
                    ) : (
                      <span className="text-black">{lead.role}</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-xs">
                    {lead.university === "View profile" ? (
                      <span className="text-red-500 cursor-pointer">{lead.university}</span>
                    ) : (
                      <span className="text-black">{lead.university}</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-xs">
                    {lead.email === "View profile" ? (
                      <span className="text-red-500 cursor-pointer">{lead.email}</span>
                    ) : (
                      <span className="text-black">{lead.email}</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-xs">
                    {lead.location === "View profile" ? (
                      <span className="text-red-500 cursor-pointer">{lead.location}</span>
                    ) : (
                      <span className="text-black">{lead.location}</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-xs font-semibold text-purple-600">{lead.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        
        <div className="text-center">
          <div className="bg-white border border-purple-200 rounded-lg py-3 mb-3">
            <p className="text-base font-semibold text-black">40 EXPORTABLE LEADS</p>
          </div>

          <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg mb-2">
            EXPORT CSV
          </button>

          <p className="text-sm text-gray-600">
            We only use publicly visible data. No private scraping
          </p>
        </div>
      </main>
    </div>
    </div>
  )
}