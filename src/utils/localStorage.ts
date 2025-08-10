// src/utils/localStorage.ts
import { FormSchema } from '../types/formTypes';

const FORMS_KEY = 'dynamicForms';

export const saveForm = (form: FormSchema): void => {
  const existingForms = getForms();
  const updatedForms = [...existingForms.filter(f => f.id !== form.id), form];
  localStorage.setItem(FORMS_KEY, JSON.stringify(updatedForms));
};

export const getForms = (): FormSchema[] => {
  const formsJson = localStorage.getItem(FORMS_KEY);
  return formsJson ? JSON.parse(formsJson) : [];
};

export const getFormById = (id: string): FormSchema | null => {
  const forms = getForms();
  return forms.find(form => form.id === id) || null;
};

export const deleteForm = (id: string): void => {
  const forms = getForms().filter(form => form.id !== id);
  localStorage.setItem(FORMS_KEY, JSON.stringify(forms));
};
