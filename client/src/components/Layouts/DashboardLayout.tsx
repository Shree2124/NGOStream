// import React, { useState } from "react";
// import {
//   Sidebar,
//   SidebarMenu,
//   SidebarMenuItem,
//   SidebarMenuSub,
// } from "../ui/sidebar";
// import {
//   Home,
//   Users,
//   Gift,
//   Calendar,
//   Flag,
//   ChevronDown,
//   ChevronUp,
//   LogOut,
//   Menu,
//   X,
// } from "lucide-react";

// interface Tab {
//   name: string;
//   path: string;
//   icon: React.ReactNode;
//   children?: Tab[];
// }

// const fitNotesTabs: Tab[] = [
//   { name: "Home", path: "/dashboard", icon: <Home /> },
//   {
//     name: "Member Management",
//     path: "/dashboard/members",
//     icon: <Users />,
//     children: [
//       { name: "Add Member", path: "/dashboard/members/add", icon: <Users /> },
//       { name: "View Members", path: "/dashboard/members/view", icon: <Users /> },
//     ],
//   },
//   { name: "Donations", path: "/dashboard/donations", icon: <Gift /> },
//   { name: "Events", path: "/dashboard/events", icon: <Calendar /> },
//   { name: "Goals", path: "/dashboard/goals", icon: <Flag /> },
// ];

// const DashboardLayout: React.FC = ({ children }) => {
//   const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
//   const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
//   const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

//   const toggleMenu = (menuName: string) => {
//     setExpandedMenus((prev) =>
//       prev.includes(menuName)
//         ? prev.filter((menu) => menu !== menuName)
//         : [...prev, menuName]
//     );
//   };

//   const toggleSidebar = () => setIsMobileSidebarOpen(!isMobileSidebarOpen);

//   return (
//     <div className="flex bg-gray-100 h-screen">
//       <div
//         className={`${
//           isSidebarOpen ? "w-64" : "w-20"
//         } hidden lg:flex flex-col bg-gradient-to-b from-blue-700 to-blue-800 text-white shadow-lg transition-all duration-300`}
//       >
//         <div
//           className="p-6 font-bold text-xl text-center tracking-wide cursor-pointer"
//           onClick={() => setIsSidebarOpen(!isSidebarOpen)}
//         >
//           {isSidebarOpen ? "NGOStream" : "NGO"}
//         </div>
//         <SidebarMenu>
//           {fitNotesTabs.map((tab) => (
//             <React.Fragment key={tab.name}>
//               {!tab.children ? (
//                 <SidebarMenuItem
//                   to={tab.path}
//                   icon={tab.icon}
//                   className="flex items-center gap-4 hover:bg-blue-700 hover:text-white transition-colors"
//                 >
//                   {isSidebarOpen && tab.name}
//                 </SidebarMenuItem>
//               ) : (
//                 <SidebarMenuSub>
//                   <div
//                     className="flex justify-between items-center hover:bg-blue-700 px-4 py-3 hover:text-white transition-colors cursor-pointer"
//                     onClick={() => toggleMenu(tab.name)}
//                   >
//                     <div className="flex items-center space-x-3">
//                       {tab.icon}
//                       {isSidebarOpen && <span>{tab.name}</span>}
//                     </div>
//                     {isSidebarOpen &&
//                       (expandedMenus.includes(tab.name) ? (
//                         <ChevronUp size={16} />
//                       ) : (
//                         <ChevronDown size={16} />
//                       ))}
//                   </div>
//                   {expandedMenus.includes(tab.name) && (
//                     <div className="bg-blue-700/20 pl-8">
//                       {tab.children.map((subTab) => (
//                         <SidebarMenuItem
//                           key={subTab.name}
//                           to={subTab.path}
//                           icon={subTab.icon}
//                           className="flex items-center gap-4 hover:bg-blue-600 hover:text-white transition-colors"
//                         >
//                           {subTab.name}
//                         </SidebarMenuItem>
//                       ))}
//                     </div>
//                   )}
//                 </SidebarMenuSub>
//               )}
//             </React.Fragment>
//           ))}
//         </SidebarMenu>
//         <div className="mt-auto px-4 py-3">
//           <SidebarMenuItem
//             to="#"
//             icon={<LogOut />}
//             className="flex items-center gap-4 hover:bg-red-600 hover:text-white transition-colors"
//           >
//             {isSidebarOpen && "Logout"}
//           </SidebarMenuItem>
//         </div>
//       </div>

//       <div
//         className={`fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden ${isMobileSidebarOpen ? "block" : "hidden"}`}
//         onClick={toggleSidebar}
//       />
//       <div
//         className={`fixed inset-y-0 left-0 z-50 bg-gradient-to-b from-blue-700 to-blue-800 text-white shadow-lg w-64 transform transition-transform duration-300 lg:hidden ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
//       >
//         <div className="p-6 font-bold text-xl text-center tracking-wide">
//           NGOStream
//         </div>
//         <SidebarMenu>
//           {fitNotesTabs.map((tab) => (
//             <React.Fragment key={tab.name}>
//               {!tab.children ? (
//                 <SidebarMenuItem
//                   to={tab.path}
//                   icon={tab.icon}
//                   className="flex items-center gap-4 hover:bg-blue-700 hover:text-white transition-colors"
//                 >
//                   {tab.name}
//                 </SidebarMenuItem>
//               ) : (
//                 <SidebarMenuSub>
//                   <div
//                     className="flex justify-between items-center hover:bg-blue-700 px-4 py-3 hover:text-white transition-colors cursor-pointer"
//                     onClick={() => toggleMenu(tab.name)}
//                   >
//                     <div className="flex items-center space-x-3">
//                       {tab.icon}
//                       <span>{tab.name}</span>
//                     </div>
//                     {expandedMenus.includes(tab.name) ? (
//                       <ChevronUp size={16} />
//                     ) : (
//                       <ChevronDown size={16} />
//                     )}
//                   </div>
//                   {expandedMenus.includes(tab.name) && (
//                     <div className="bg-blue-700/20 pl-8">
//                       {tab.children.map((subTab) => (
//                         <SidebarMenuItem
//                           key={subTab.name}
//                           to={subTab.path}
//                           icon={subTab.icon}
//                           className="flex items-center gap-4 hover:bg-blue-600 hover:text-white transition-colors"
//                         >
//                           {subTab.name}
//                         </SidebarMenuItem>
//                       ))}
//                     </div>
//                   )}
//                 </SidebarMenuSub>
//               )}
//             </React.Fragment>
//           ))}
//         </SidebarMenu>
//         <div className="mt-auto px-4 py-3">
//           <SidebarMenuItem
//             to="#"
//             icon={<LogOut />}
//             className="flex items-center gap-4 hover:bg-red-600 hover:text-white transition-colors"
//           >
//             Logout
//           </SidebarMenuItem>
//         </div>
//       </div>

//       <div className="flex-1 bg-gray-50 overflow-y-auto">
//         <div className="lg:hidden top-4 left-4 z-50 fixed">
//           <button
//             className="bg-blue-600 hover:bg-blue-700 shadow-md p-2 rounded-md focus:outline-none text-white"
//             onClick={toggleSidebar}
//           >
//             {isMobileSidebarOpen ? <X size={24} /> : <Menu size={24} />}
//           </button>
//         </div>

//         <div className="p-6">{children}</div>
//       </div>
//     </div>
//   );
// };

// export default DashboardLayout;



import {
  Box,
  Stack,
  Typography,
  styled,
  Button,
  Collapse,
  Grid,
  IconButton,
  Drawer,
} from "@mui/material";
import {
  Close,
  Menu,
  ExitToApp,
  Home,
  ManageAccounts,
  VolunteerActivism,
  Event,
  Flag,
  // AccountBalance,
  ArrowDropDown,
  Money,
} from "@mui/icons-material";
import { ReactNode, useState } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";

const fontFamily = "'Poppins', sans-serif";

interface Tab {
  name: string;
  path: string;
  icon?: JSX.Element;
  subTabs?: Tab[];
}

const navTabs: Tab[] = [
  { name: "Home", path: "/dashboard", icon: <Home /> },
  {
    name: "Member Management",
    path: "/dashboard/members-details",
    icon: <ManageAccounts />,
  },
  {
    name: "Donations",
    path: "/dashboard/donation-details",
    icon: <VolunteerActivism />,
    subTabs: [
      { name: "In-Kind", path: "/inkind" },
      { name: "Monetary", path: "/monetary" },
    ],
  },
  { name: "Events", path: "/dashboard/events", icon: <Event /> },
  { name: "Campaign", path: "/dashboard/goals", icon: <Flag /> },
  // { name: "Schemes", path: "/dashboard/schemes", icon: <AccountBalance /> },
  { name: "Impact", path: "/dashboard/impact", icon: <Money /> },
]; 

const Link = styled(RouterLink)(({ theme }) => ({
  textDecoration: "none",
  borderRadius: "8px",
  padding: "0.8rem 1rem",
  display: "flex",
  alignItems: "center",
  color: theme.palette.text.primary,
  fontFamily: fontFamily,
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    backgroundColor:" rgba(0, 0, 0, 0.1)",
    // color: "",
  },
}));

const SideBar: React.FC<{w: string}> = ({w}) => {
  const location = useLocation();
  const [openTabs, setOpenTabs] = useState<Record<string, boolean>>({});

  const toggleDropdown = (tabName: string) => {
    setOpenTabs((prev) => ({ ...prev, [tabName]: !prev[tabName] }));
  };

  return (
    <Stack
      width={w}
      bgcolor="whitesmoke"
      height="100vh"
      direction="column"
      justifyContent="space-between"
      p="2rem"
      spacing="2rem"
      alignItems="center"
      sx={{
        color: "black",
        fontFamily: fontFamily,
        boxShadow: "2px 0 8px rgba(0, 0, 0, 0.2)",
        position: "relative",
      }}
    >
      <Typography
        variant="h4"
        sx={{
          fontWeight: "bold",
          textAlign: "center",
          fontFamily: "monospace",
        }}
      >
        NGOStream
      </Typography>

      <Stack spacing="0.7rem" width="100%">
        {navTabs.map((tab) => (
          <Box key={tab.path} width="100%">
            {tab.subTabs ? (
              <>
                <Button
                  onClick={() => toggleDropdown(tab.name)}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                    textAlign: "left",
                    color: "black",
                    padding: "0.8rem 1rem",
                    bgcolor: openTabs[tab.name] ? "rgba(0, 0, 0, 0.1)" : "transparent",
                    "&:hover": { bgcolor: "rgba(0, 0, 0, 0.1)" },
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing="1rem">
                    {tab.icon}
                    <Typography>{tab.name}</Typography>
                  </Stack>
                  <ArrowDropDown
                    sx={{
                      transform: openTabs[tab.name] ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.3s ease-in-out",
                    }}
                  />
                </Button>
                <Collapse in={openTabs[tab.name]} timeout="auto">
                  <Stack pl="2rem">
                    {tab.subTabs.map((subTab) => (
                      <Link key={subTab.path} to={tab.path + subTab.path}>
                        <Stack direction="row" alignItems="center" spacing="1rem">
                          {subTab.icon}
                          <Typography>{subTab.name}</Typography>
                        </Stack>
                      </Link>
                    ))}
                  </Stack>
                </Collapse>
              </>
            ) : (
              <Link
                to={tab.path}
                sx={location.pathname === tab.path ? { bgcolor: "black", color: "white" } : undefined}
              >
                <Stack direction="row" alignItems="center" spacing="1rem">
                  {tab.icon}
                  <Typography>{tab.name}</Typography>
                </Stack>
              </Link>
            )}
          </Box>
        ))}
      </Stack>

      <Stack>
        <Link to="#">
          <Stack direction="row" alignItems="center" spacing="1rem">
            <ExitToApp />
            <Typography>Logout</Typography>
          </Stack>
        </Link>
      </Stack>
    </Stack>
  );
};


interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);

  const handleMobile = () => {
    setIsMobile(!isMobile);
  };
  const handleClose = () => {
    setIsMobile(false);
  };

  return (
    <Grid
      container
      sx={{
        bgcolor: "background.default",
        fontFamily: fontFamily,
        minHeight: "100vh",
      }}
    >
      <Box
        sx={{
          display: { xs: "block", md: "none" },
          position: "fixed",
          right: "1rem",
          top: "1rem",
          zIndex: 10,
        }}
      >
        <IconButton
          onClick={handleMobile}
          sx={{
            color: "primary.main",
            fontSize: "2rem",
          }}
        >
          {isMobile ? <Close /> : <Menu />}
        </IconButton>
      </Box>

      <Grid
        item
        md={3}
        lg={2.5}
        sx={{
          display: { xs: "none", md: "block" },
          height: "100vh",
        }}
      >
        <SideBar w="100%"/>
      </Grid>

      <Grid
        item
        xs={12}
        md={9}
        lg={9.5}
        sx={{
          bgcolor: "background.paper",
          padding: "2rem",
          overflowY: "auto",
          height: "100vh",
        }}
      >
        {children}
      </Grid>

      <Drawer
        open={isMobile}
        onClose={handleClose}
        PaperProps={{
          sx: {
            bgcolor: "background.default",
            width: "75vw",
          },
        }}
      >
        <SideBar w="75vw" />
      </Drawer>
    </Grid>
  );
};

export default DashboardLayout;