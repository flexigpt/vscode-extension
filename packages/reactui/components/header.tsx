// import * as React from 'react';
// import { Link } from '@nextui-org/link';

// // import { Sidebar } from '@/reactui/components/sidebar';
// import {
//   IconGitHub,
//   IconNextChat,
//   IconSeparator,
// } from '@/reactui/components/ui/icons';
// import { SidebarFooter } from '@/reactui/components/sidebar-footer';

// export function Header() {
//   const session = {
//     user: {
//       id: '1',
//       name: 'John Doe',
//       email: 'john@doe'
//     }
//   };
//   return (
//     <header className="sticky top-0 z-50 flex items-center justify-between w-full h-16 px-4 border-b shrink-0 bg-gradient-to-b from-background/10 via-background/50 to-background/80 backdrop-blur-xl">
//       <div className="flex items-center">
//         {session?.user ? (
//           // <Sidebar>
//             <SidebarFooter>
//               {/* <ClearHistory clearChats={clearChats} /> */}
//             </SidebarFooter>
//           // </Sidebar>
//         ) : (
//           <Link href="/" target="_blank" rel="nofollow">
//             <IconNextChat className="w-6 h-6 mr-2 dark:hidden" inverted />
//             <IconNextChat className="hidden w-6 h-6 mr-2 dark:block" />
//           </Link>
//         )}
//       </div>
//     </header>
//   );
// }
