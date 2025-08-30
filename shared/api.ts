/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/** Example response type for /api/demo */
export interface DemoResponse {
  message: string;
}

// Slider images
export interface SliderImage {
  id: string; // uuid
  url: string;
  alt?: string;
}

export interface SliderResponse {
  images: SliderImage[];
}

export interface UpdateSliderRequest {
  images: SliderImage[];
}

// Logos ticker
export interface LogoItem {
  id: string;
  url: string;
  href?: string;
  alt?: string;
}

export interface LogosResponse {
  logos: LogoItem[];
}

// Contact form
export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  recaptchaToken?: string; // optional when captcha not configured
}

export interface ContactResponse {
  ok: boolean;
  message: string;
  fieldErrors?: Partial<Record<keyof ContactFormData, string>>;
}

// Messages storage (temporary backend store)
export interface MessageItem {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  country?: string; // ISO code
  type?: string; // inquiry type
  mobile?: string;
  approved?: boolean;
  read?: boolean;
  at: string; // ISO date
}

export interface ListMessagesResponse {
  items: MessageItem[];
}

export interface CreateMessageRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
  country?: string;
  type?: string;
  mobile?: string;
}

export interface CreateMessageResponse {
  item: MessageItem;
}
