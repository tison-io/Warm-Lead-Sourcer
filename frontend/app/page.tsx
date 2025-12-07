import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
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
          <div className="flex items-center gap-8">
            <Link href="#" className="text-sm text-gray-700 hover:text-black">
              Home
            </Link>
            <Link href="#how-it-works" className="text-sm text-gray-700 hover:text-black">
             How it works
            </Link>
            <Link href="#use-cases" className="text-sm text-gray-700 hover:text-black">
              Use Cases
            </Link>
            <Link href="#compliance" className="text-sm text-gray-700 hover:text-black">
              Privacy & Legal
            </Link>
            <Link href="/signup">
              <Button 
                variant="outline"
                className="rounded-[15px] border-2 bg-white px-8 py-2 text-black hover:bg-gray-200"
                style={{ 
                  borderImage: 'linear-gradient(to right, #6E5099, #AD7EF1) 1'
                }}
              >
                Sign Up
              </Button>
            </Link>
            <Link href="/login">
              <Button 
                className="rounded-[15px] px-8 py-2 text-white hover:opacity-90"
                style={{ 
                  background: 'linear-gradient(to right, #6E5099, #AD7EF1)'
                }}
              >
                Login
              </Button>
            </Link>
          </div>
        </div>
      </nav>

     
      <section
        className="relative min-h-[600px] bg-cover bg-center"
        style={{ backgroundImage: "url(/images/landing_page.png)" }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative mx-auto flex max-w-7xl flex-col items-center justify-center px-6 py-32 text-center">
          <h1 className="mb-12 text-5xl font-bold leading-tight text-white">
            Turn Social Engagement Into
            <br />
            Warm Leads _ Instantly
          </h1>
          <div className="flex gap-4">
            <Button
              variant="outline"
              className="rounded-lg border-2 border-white bg-transparent px-24 py-6 text-lg text-white hover:bg-white/10"
            >
              &nbsp;
            </Button>
            <Link href="/signup">
              <Button className="rounded-lg bg-purple-500 px-12 py-6 text-lg text-white hover:bg-purple-600">
                Start Extraction
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-gray-50 px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-12 text-center text-4xl font-bold text-black">
            <span style={{ color: '#9C2BFF' }}>How</span> It Works
          </h2>
          <div className="flex flex-col md:flex-row items-center gap-12">
            {/* Left side - Image */}
            <div className="flex-1">
              <Image 
                src="/images/leftlanding.jpg" 
                alt="How it works illustration" 
                width={800}
                height={200}
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>
            
            {/* Right side - Steps list */}
            <div className="flex-1 space-y-8">
              <div className="flex items-start gap-4">
                <div className="shrink-0">
                  <svg width="31" height="31" viewBox="0 0 31 31" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="31" height="31" rx="15.5" fill="#B2B2FF"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M10.268 5.59277C10.4435 5.28874 10.696 5.03627 11 4.86074C11.3041 4.6852 11.6489 4.59278 12 4.59277H17C17.3511 4.59278 17.6959 4.6852 18 4.86074C18.304 5.03627 18.5565 5.28874 18.732 5.59277H20C20.5304 5.59277 21.0391 5.80349 21.4142 6.17856C21.7893 6.55363 22 7.06234 22 7.59277V11.5928H23C23.5304 11.5928 24.0391 11.8035 24.4142 12.1786C24.7893 12.5536 25 13.0623 25 13.5928V22.5928C25 23.1232 24.7893 23.6319 24.4142 24.007C24.0391 24.3821 23.5304 24.5928 23 24.5928H15C14.4696 24.5928 13.9609 24.3821 13.5858 24.007C13.2107 23.6319 13 23.1232 13 22.5928V21.5928H9C8.46957 21.5928 7.96086 21.3821 7.58579 21.007C7.21071 20.6319 7 20.1232 7 19.5928V7.59277C7 7.06234 7.21071 6.55363 7.58579 6.17856C7.96086 5.80349 8.46957 5.59277 9 5.59277H10.268ZM10 7.59277H9V19.5928H13V13.5928C13 13.0623 13.2107 12.5536 13.5858 12.1786C13.9609 11.8035 14.4696 11.5928 15 11.5928H20V7.59277H19C19 8.12321 18.7893 8.63191 18.4142 9.00699C18.0391 9.38206 17.5304 9.59277 17 9.59277H12C11.4696 9.59277 10.9609 9.38206 10.5858 9.00699C10.2107 8.63191 10 8.12321 10 7.59277ZM15 13.5928V22.5928H23V13.5928H15ZM17 6.59277H12V7.59277H17V6.59277Z" fill="black"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-black mb-6">Post a public URL</h3>
                  <p className="text-sm text-gray-600 mb-10">🎯 Identify Warm Intent. Drop a link to instantly target users who have already shown interest in a topic relevant to your brand.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="shrink-0">
                  <svg width="28" height="27" viewBox="0 0 28 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="28" height="27" rx="13.5" fill="#C6A2FF"/>
                    <path d="M15 22C13.75 22 12.5793 21.7627 11.488 21.288C10.3967 20.8133 9.44667 20.1717 8.638 19.363C7.82933 18.5543 7.18767 17.6043 6.713 16.513C6.23833 15.4217 6.00067 14.2507 6 13C5.99933 11.7493 6.237 10.5787 6.713 9.488C7.189 8.39733 7.83033 7.44733 8.637 6.638C9.44367 5.82867 10.3937 5.187 11.487 4.713C12.5803 4.239 13.7513 4.00133 15 4V6C13.05 6 11.396 6.67933 10.038 8.038C8.68 9.39667 8.00067 11.0507 8 13C7.99933 14.9493 8.67867 16.6037 10.038 17.963C11.3973 19.3223 13.0513 20.0013 15 20V22ZM19 18L17.6 16.575L20.175 14H12V12H20.175L17.6 9.4L19 8L24 13L19 18Z" fill="black"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-black mb-6">We extract reactions + do public-only enrichment</h3>
                  <p className="text-sm text-gray-600 mb-10">✨ Validate & Enrich Leads. We automatically extract engaged users and enhance their profiles with only public data.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="shrink-0">
                  <svg width="26" height="29" viewBox="0 0 26 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="26" height="29" rx="13" fill="#B2B2FF"/>
                    <path d="M13 17.5L8 12.5L9.4 11.05L12 13.65V5.5H14V13.65L16.6 11.05L18 12.5L13 17.5ZM7 21.5C6.45 21.5 5.97933 21.3043 5.588 20.913C5.19667 20.5217 5.00067 20.0507 5 19.5V16.5H7V19.5H19V16.5H21V19.5C21 20.05 20.8043 20.521 20.413 20.913C20.0217 21.305 19.5507 21.5007 19 21.5H7Z" fill="black"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-black mb-6">Download a clean CSV/XLSX lead list</h3>
                  <p className="text-sm text-gray-600 mb-10">📥 CRM-Ready Lead List. Export a clean, structured list in your preferred format (CSV/XLSX) with zero manual cleanup required.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="bg-white px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-12 text-center text-4xl font-bold text-black">Use cases</h2>
          <div className="grid gap-12 md:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center">  
                <div className="mb-4  mr-4 w-20 h-20 rounded-full overflow-hidden">
                <Image 
                  src="/images/Recruiters.jpg" 
                  alt="Recruiters" 
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="mb-4 text-xl font-bold text-black">Recruiters</h3></div>
            
              <p className="text-sm text-gray-700">Identify passive candidates who have proven expertise and alignment before you even send the first message.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center">  
                <div className="mb-4  mr-4 w-20 h-20 rounded-full overflow-hidden">
                <Image 
                  src="/images/Founders.jpg" 
                  alt="Founders" 
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </div>

              <h3 className="mb-4 text-xl font-bold text-black">Founders</h3>
              </div>
              <p className="text-sm text-gray-700">
                Identify early adopters, key advocates, and potential investors who are already bought into your vision and product story.
               
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center">
              
              <div className="mb-4 mr-4 w-20 h-20 rounded-full overflow-hidden">
                <Image 
                  src="/images/Growth.jpg" 
                  alt="Growth" 
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="mb-4 text-xl font-bold text-black">Growth</h3></div>
              
              <p className="text-sm text-gray-700">
              Focus your sales efforts exclusively on pre-qualified leads with a higher probability of conversion and a shorter sales cycle.
               
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance Section */}
      <section id="compliance" className="bg-white px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-8 text-3xl font-bold text-black">Compliance & Privacy Section</h2>
          <ul className="space-y-2 text-center text-sm text-gray-700">
            <li>• Public-only data disclaimer</li>
            <li>• No private data scraping</li>
            <li>• Temporary PII storage</li>
            <li>• 30-day auto-deletion</li>
            <li>• Clear "export/delete request" instructions</li>
          </ul>
        </div>
      </section>

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
            <Link href="#how-it-works" className="hover:underline">
              How it works
            </Link>
            <Link href="#use-cases" className="hover:underline">
              Use Cases
            </Link>
            <Link href="#compliance" className="hover:underline">
              Privacy & Legal
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
