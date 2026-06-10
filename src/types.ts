export interface UserProfile {
  name: string;
  email: string;
  document: string;
  phone: string;
  professionalId: string; // CRM or CRO
  status: 'trial' | 'premium';
  trialDaysLeft: number;
}

export interface N8NConfig {
  n8nWebhookUrl: string;
  whatsappNumber: string;
  apiToken: string;
  provider: 'evolution' | 'zapi' | 'official' | 'generic';
  isActive: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'patient' | 'ai' | 'system';
  text: string;
  timestamp: string;
}

export interface CustomizationSettings {
  clinicName: string;
  businessHours: string;
  appointmentDuration: string;
  procedures: string;
  greetingMessage: string;
  specialInstructions: string;
}

