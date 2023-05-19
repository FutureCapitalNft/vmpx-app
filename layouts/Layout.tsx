import { CssBaseline } from "@mui/material";
import styles from "../styles/Home.module.css";
import Notifications from "./Notifications";
import Footer from "./Footer";
import ApplicationBar from "./ApplicationBar";
import {FlexibleThemeProvider} from "../contexts/Theme";

const Layout = ({children, tokenAddress, contractAddress, projectId}: any) => {
  // TODO replace
  // const { notifications, setProcessing } = useContext(NotificationsContext);
  return (
    <FlexibleThemeProvider>
      <CssBaseline/>
      <Notifications />
      <ApplicationBar/>
      <main className={styles.main}
            style={{ minHeight: '90vh' }}>
        {/*<ProcessingScreen open={notifications.isProcessing}
                          onClose={() => setProcessing(false)} />*/}
        <section style={{width: '100%'}}>
          {children}
        </section>
      </main>
      <Footer projectId={projectId}
              contractAddress={contractAddress}
              tokenAddress={tokenAddress} />
    </FlexibleThemeProvider>
  )
};

export default Layout
