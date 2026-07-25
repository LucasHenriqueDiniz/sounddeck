import type { EventFriendlyMeta } from "../types/soundEvent";

/**
 * Canonical Windows sound events, grouped into the six product categories.
 * Technical ids (`app`/`event`) match real HKCU\AppEvents\Schemes\Apps
 * aliases so this catalog stays consistent with what `scan_events` (the
 * real Tauri command) would actually return — only the presentation layer
 * (friendly name, description, category) is product-defined.
 */
export const SOUND_EVENT_CATALOG: EventFriendlyMeta[] = [
  // Sistema
  {
    id: { app: ".Default", event: "SystemAsterisk" },
    friendlyName: "Aviso do sistema",
    description: "Toca quando o Windows exibe uma informação geral.",
    category: "system",
  },
  {
    id: { app: ".Default", event: "SystemExclamation" },
    friendlyName: "Alerta do sistema",
    description: "Toca em avisos que pedem atenção, mas não são erros.",
    category: "system",
  },
  {
    id: { app: ".Default", event: "SystemHand" },
    friendlyName: "Erro crítico",
    description: "Toca em erros graves ou operações bloqueadas.",
    category: "system",
  },
  {
    id: { app: ".Default", event: "SystemQuestion" },
    friendlyName: "Pergunta do sistema",
    description: "Toca em caixas de diálogo de confirmação.",
    category: "system",
  },
  {
    id: { app: ".Default", event: ".Default" },
    friendlyName: "Som padrão",
    description: "Som genérico usado quando nenhum outro evento se aplica.",
    category: "system",
  },
  {
    id: { app: ".Default", event: "MenuCommand" },
    friendlyName: "Comando de menu",
    category: "system",
  },

  // Notificações
  {
    id: { app: ".Default", event: "Notification.Default" },
    friendlyName: "Notificação padrão",
    description: "Toast genérico do Windows.",
    category: "notifications",
  },
  {
    id: { app: ".Default", event: "Notification.IM" },
    friendlyName: "Mensagem instantânea",
    category: "notifications",
  },
  {
    id: { app: ".Default", event: "Notification.Mail" },
    friendlyName: "Novo e-mail",
    category: "notifications",
  },
  {
    id: { app: ".Default", event: "Notification.Reminder" },
    friendlyName: "Lembrete",
    category: "notifications",
  },
  {
    id: { app: ".Default", event: "Notification.SMS" },
    friendlyName: "SMS recebido",
    category: "notifications",
  },

  // Dispositivos
  {
    id: { app: ".Default", event: "DeviceConnect" },
    friendlyName: "Dispositivo conectado",
    description: "Toca ao conectar um dispositivo USB ou Bluetooth.",
    category: "devices",
  },
  {
    id: { app: ".Default", event: "DeviceDisconnect" },
    friendlyName: "Dispositivo desconectado",
    category: "devices",
  },
  {
    id: { app: ".Default", event: "DeviceFail" },
    friendlyName: "Falha de dispositivo",
    description: "Toca quando um dispositivo não é reconhecido.",
    category: "devices",
  },

  // Energia
  {
    id: { app: ".Default", event: "LowBatteryAlarm" },
    friendlyName: "Bateria fraca",
    category: "power",
  },
  {
    id: { app: ".Default", event: "CriticalBatteryAlarm" },
    friendlyName: "Bateria crítica",
    description: "Toca quando a carga está prestes a se esgotar.",
    category: "power",
  },

  // Explorer
  {
    id: { app: ".Default", event: "Navigating" },
    friendlyName: "Navegação no Explorer",
    category: "explorer",
  },
  {
    id: { app: ".Default", event: "EmptyRecycleBin" },
    friendlyName: "Esvaziar lixeira",
    category: "explorer",
  },
  {
    id: { app: ".Default", event: "BlockedPopup" },
    friendlyName: "Pop-up bloqueado",
    category: "explorer",
  },
  {
    id: { app: ".Default", event: "Open" },
    friendlyName: "Abrir programa",
    category: "explorer",
  },
  {
    id: { app: ".Default", event: "Close" },
    friendlyName: "Fechar programa",
    category: "explorer",
  },
  {
    id: { app: ".Default", event: "Minimize" },
    friendlyName: "Minimizar janela",
    category: "explorer",
  },
  {
    id: { app: ".Default", event: "Maximize" },
    friendlyName: "Maximizar janela",
    category: "explorer",
  },
  {
    id: { app: ".Default", event: "RestoreUp" },
    friendlyName: "Restaurar janela (maximizada)",
    category: "explorer",
  },
  {
    id: { app: ".Default", event: "RestoreDown" },
    friendlyName: "Restaurar janela (minimizada)",
    category: "explorer",
  },

  // Sessão
  {
    id: { app: ".Default", event: "WindowsLogon" },
    friendlyName: "Entrar no Windows",
    category: "session",
  },
  {
    id: { app: ".Default", event: "WindowsLogoff" },
    friendlyName: "Sair do Windows",
    category: "session",
  },
  {
    id: { app: ".Default", event: "WindowsUAC" },
    friendlyName: "Controle de Conta de Usuário",
    description: "Toca ao solicitar permissão administrativa.",
    category: "session",
  },
];
