import {Alert, AlertTitle, Button, IconButton, Stack} from "@mui/material";
import React, {useContext} from "react";
import {NotificationsContext} from "@/contexts/Notifications";
import CloseIcon from '@mui/icons-material/Close';

const AlertInstance = ({ alert, onActionClick, removeAlert }: any) => (
  <Alert variant="filled"
         severity={alert.severity}
         sx={{
           backgroundColor: theme => theme.palette.mode === 'light' ? '#A9A9A9': '#808080',
           color: theme => theme.palette.getContrastText(theme.palette.mode === 'light' ? '#A9A9A9': '#808080'),
           display: 'flex',
           alignItems: 'center'
         }}
         action={<Stack direction="row">
           {alert.action && <Button variant="contained"
                                    disableElevation
                                    disableRipple
                                    sx={{
                                      backgroundColor: theme => theme.palette.mode === 'light'
                                        ? theme.palette.grey.A700
                                        : theme.palette.grey.A200,
                                      margin: 0
                                    }}
                                    size="small"
                                    onClick={onActionClick(alert.key, alert.action)} >
             {alert.cta || 'Proceed'}
           </Button>}
           <IconButton onClick={removeAlert(alert)}>
             <CloseIcon />
           </IconButton>
         </Stack>}
         onClose={removeAlert(alert)}>
    <AlertTitle sx={{ margin: 0 }}>{alert.text}</AlertTitle>
  </Alert>
)

const Alerts = () => {
  const { notifications, dispatchNotification } = useContext(NotificationsContext);

  const onActionClick = (key: any, action: any) => () => {
    action()
      .then(() => {
        dispatchNotification({type: 'removeAlert', payload: key});
      })
      .catch(console.error)
  }

  const removeAlert = (a: any) => () => {
    if (a) {
      dispatchNotification({type: 'removeAlert', payload: a.key})
    }
  }

  return (
    <Stack direction="column" spacing={0}>
      {notifications.alerts
        .map((alert: any) => <AlertInstance key={alert.key}
                                            alert={alert}
                                            onActionClick={onActionClick}
                                            removeAlert={removeAlert} />)
      }
    </Stack>
  )
}

export default Alerts
