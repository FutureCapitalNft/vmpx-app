import { CssBaseline } from "@mui/material";
import styles from "../styles/Home.module.css";
import Notifications from "./Notifications";
import Footer from "./Footer";
import ApplicationBar from "./ApplicationBar";
import {FlexibleThemeProvider} from "@/contexts/Theme";

const Layout = ({children, contractAddress, projectId}: any) => {
  return (
    <FlexibleThemeProvider>
      <CssBaseline/>
      <Notifications />
      <ApplicationBar/>
      <main className={styles.main}
            style={{ minHeight: '90vh' }}>
        <section style={{width: '100%'}}>
          {children}
        </section>
      </main>
      <Footer projectId={projectId}
              contractAddress={contractAddress} />
    </FlexibleThemeProvider>
  )
};

export default Layout
