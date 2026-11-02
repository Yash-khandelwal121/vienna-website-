/**
 * Vienna Day Trip — JSON-LD Schema Structured Data Injector
 * 
 * Safely parses, validates, and injects or updates custom JSON-LD schemas
 * in the document <head>. Enforces deterministic element IDs to strictly
 * prevent duplicate script injections.
 */

export const VDT_CUSTOM_SCHEMA_SCRIPT_ID = 'vdt-custom-schema';

/**
 * Clean schema string by extracting inner content if wrapped in <script> tags,
 * and validate as JSON.
 */
export function cleanAndValidateJson(schemaContent) {
  if (!schemaContent) return { valid: true, jsonString: null, parsed: null };
  
  let raw = typeof schemaContent === 'string' ? schemaContent.trim() : JSON.stringify(schemaContent);
  if (!raw) return { valid: true, jsonString: null, parsed: null };

  // Strip <script type="application/ld+json">...</script> wrapper if user pasted it
  const match = raw.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
  if (match) {
    raw = match[1].trim();
  }

  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) {
      return { valid: false, error: 'JSON-LD must be a JSON object or array.' };
    }
    return { valid: true, jsonString: JSON.stringify(parsed, null, 2), parsed };
  } catch (err) {
    return { valid: false, error: err.message };
  }
}

/**
 * Injects or updates a <script type="application/ld+json"> tag in document.head.
 * If the element already exists, it updates its content to prevent duplicate injection.
 * If content is empty or invalid, removes any stale script.
 */
export function injectCustomSchema(schemaContent, elementId = VDT_CUSTOM_SCHEMA_SCRIPT_ID) {
  if (!schemaContent) {
    removeCustomSchema(elementId);
    return null;
  }

  const { valid, jsonString, error } = cleanAndValidateJson(schemaContent);
  if (!valid || !jsonString) {
    if (error) {
      console.warn(`[VDT Schema] Skipped invalid JSON-LD schema for ${elementId}:`, error);
    }
    removeCustomSchema(elementId);
    return null;
  }

  try {
    let scriptTag = document.getElementById(elementId);
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = elementId;
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = jsonString;
    return scriptTag;
  } catch (e) {
    console.error(`[VDT Schema] Error injecting schema element:`, e);
    return null;
  }
}

/**
 * Removes schema script tag from document.head by element ID
 */
export function removeCustomSchema(elementId = VDT_CUSTOM_SCHEMA_SCRIPT_ID) {
  try {
    const el = document.getElementById(elementId);
    if (el && el.parentNode) {
      el.parentNode.removeChild(el);
    }
  } catch (e) {}
}
