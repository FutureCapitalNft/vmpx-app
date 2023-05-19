import {Alert, Snackbar} from "@mui/material";
import {useContext} from "react";
import {NotificationsContext} from "../contexts/Notifications";

const Notifications = () => {
  const {notifications, dispatchNotification} = useContext(NotificationsContext);

  const removeNotification = (a: any) => () => {
    if (a) {
      dispatchNotification({type: 'popMessage', payload: a.key})
    }
  }

  const notification = notifications.messages[0];

  return (
    <Snackbar open={!!notification}
              autoHideDuration={3000}
              anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
              onClose={removeNotification(notification)}>
      <Alert key={notification?.key}
             variant="filled"
             severity={notification?.severity}>
        {notification?.text}
      </Alert>
    </Snackbar>
  )
}

export default Notifications
