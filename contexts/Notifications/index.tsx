import {createContext, Dispatch, useReducer} from "react";

type TNotificationState = {
  isLoading: boolean,      // background data refresh is happening
  isProcessing: boolean,   // wallet interaction is happening
  alerts: any[],
  messages: any[],
}

const init = (initialState: TNotificationState) => {
  return {
    ...initialState,
  }
}

export const reducer = (state: any, action: any) => {
  // console.log(state, type, id, config)
  switch (action.type) {
    case "setLoading":
      return {
        ...state,
        isLoading: action.payload,
      };
    case "setProcessing":
      return {
        ...state,
        isProcessing: action.payload,
      };
    case "addAlert":
      return {
        ...state,
        alerts: state.alerts.find((a: any) => a.key === action.payload.key)
          ? state.alerts
          : [...state.alerts, action.payload]
      };
    case "removeAlert":
      return {
        ...state,
        alerts: state.alerts.filter((a: any) => a.key !== action.payload)
      };
    case "clearAlerts":
      return {...state, alerts: []};
    case "pushMessage":
      return {
        ...state,
        messages: state.messages.find((a: any) => a.key === action.payload.key)
          ? state.messages
          : [...state.messages, action.payload]
      };
    case "popMessage":
      return {
        ...state,
        messages: state.messages.filter((a: any) => a.key !== action.payload)
      };
    default:
      return state;
  }
}

const initialState: TNotificationState = {
  isLoading: false,      // background data refresh is happening
  isProcessing: false,   // wallet interaction is happening
  alerts: [],
  messages: [],
}

type Context = {
  notifications: TNotificationState;
  dispatchNotification: Dispatch<any>;
  message: Record<string, (...param: any) => void>;
  setProcessing: (...param: any) => void;
  setLoading: (...param: any) => void;
}

export const NotificationsContext = createContext<Context>({
  notifications: initialState,
  dispatchNotification: _ => {},
  message: {},
  setProcessing: _ => {},
  setLoading: _ => {},
});

export const NotificationsProvider = ({ children }: any) => {
  const [notifications, dispatchNotification] = useReducer(reducer, initialState, init);

  const message = {
    info: (content: string) => dispatchNotification({
      type: 'pushMessage',
      payload: { severity: 'success', text: content, key: content }
    }),
    warning: (content: string) => dispatchNotification({
      type: 'pushMessage',
      payload: { severity: 'warning', text: content, key: content }
    }),
    alert: (content: string) => dispatchNotification({
      type: 'addAlert',
      payload: { severity: 'warning', text: content, key: content }
    }),
    removeAlert: (key: string) => dispatchNotification({
      type: 'removeAlert',
      payload: key
    })
  }

  const setLoading = (status: boolean) => dispatchNotification({
    type: 'setLoading',
    payload: status
  })

  const setProcessing = (status: boolean) => dispatchNotification({
    type: 'setProcessing',
    payload: status
  })

  return (
    <NotificationsContext.Provider value={{
      notifications,
      dispatchNotification,
      message,
      setProcessing,
      setLoading
    }} >
      { children }
    </NotificationsContext.Provider>
  )
}
