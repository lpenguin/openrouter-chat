# Remaining Steps to Finish Attachment Annotation Support

## 1. **Frontend**
- Ensure the UI can display and handle messages with attachments and annotations (PDFs, images, etc.).
- Allow users to upload and preview attachments in the chat input.
- Display assistant annotations (if relevant) in the chat bubbles.

## 2. **Backend**
- **Annotation Persistence:**
  - Confirm that assistant messages save OpenRouter `annotations` in the new `annotations` column in the `messages` table.
  - Ensure that when building the OpenRouter `messages` array for a chat, assistant messages include their `annotations` (parsed from JSON) if present.
- **Annotation Reuse:**
  - When a user sends a follow-up message, include previous assistant `annotations` in the OpenRouter API request to avoid unnecessary re-parsing and reduce costs.
- **Logging:**
  - Continue logging all OpenRouter request and response payloads to `/tmp` for debugging and troubleshooting.

## 3. **Testing**
- Test the full workflow:
  - Upload a PDF/image, send a message, and verify the file is validated, saved, and sent to OpenRouter.
  - Confirm that OpenRouter responses with annotations are saved and reused in follow-up requests.
  - Check that logs are written to `/tmp` as expected.
- Use the shell script (`send_pdf_message.sh`) for end-to-end automation and regression testing.

## 4. **Database**
- Ensure the migration for the `annotations` column in the `messages` table is applied in all environments.

## 5. **Docs & Cleanup**
- Document the annotation flow and cost-saving mechanism in the project README or a dedicated doc.
- Remove any deprecated code or endpoints (e.g., old `/attachments` endpoint).

---

**Once these steps are complete, the attachment and annotation support will be robust, cost-efficient, and production-ready.**
