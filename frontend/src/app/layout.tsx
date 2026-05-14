// import type { Metadata } from "next";
// import { Inter, Poppins } from "next/font/google";
// import { ClerkProvider } from "@clerk/nextjs"; // 1. Added this import
// import "./globals.css";

// const inter = Inter({
//   subsets: ["latin"],
//   variable: "--font-inter",
//   display: "swap",
// });

// const poppins = Poppins({
//   subsets: ["latin"],
//   weight: ["300", "400", "500", "600", "700", "800"],
//   variable: "--font-poppins",
//   display: "swap",
// });

// export const metadata: Metadata = {
//   title: "AI Interview Hacker — Ace Every Interview",
//   description:
//     "AI-powered interview preparation platform. Upload your resume, practice with AI interviewers, get real-time feedback and personalized roadmaps.",
// };

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     // 2. Wrap everything in ClerkProvider
//     <ClerkProvider>
//       <html lang="en" suppressHydrationWarning>
//         <body
//           className={`${inter.variable} ${poppins.variable} font-sans bg-[#050810] text-white antialiased`}
//         >
//           {children}
//         </body>
//       </html>
//     </ClerkProvider>
//   );
// }

import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI Interview Hacker — Ace Every Interview",
  description:
    "AI-powered interview preparation platform. Upload your resume, practice with AI interviewers, get real-time feedback and personalized roadmaps.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning className="scroll-smooth"> {/* 2. Added scroll-smooth here */}
        <body
          className={`${inter.variable} ${poppins.variable} font-sans bg-[#050810] text-white antialiased`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}