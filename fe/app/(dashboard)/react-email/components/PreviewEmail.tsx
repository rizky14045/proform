"use client";

import { useEffect, useRef, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const PreviewEmail = ({
  emailComponent,
}: {
  emailComponent: React.ReactNode;
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (iframeRef.current) {
      const html = renderToStaticMarkup(emailComponent);
      const iframeDoc = iframeRef.current.contentDocument;

      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(`
          <html>
            <head>
              <style>
                ::-webkit-scrollbar {
                  display: none;
                }
                body {
                  -ms-overflow-style: none;
                  scrollbar-width: none;
                  overflow: hidden;
                  margin: 0;
                  padding: 0;
                }
              </style>
            </head>
            <body>
              ${html}
            </body>
          </html>
        `);
        iframeDoc.close();

        // Auto-resize iframe
        const resizeIframe = () => {
          if (iframeRef.current && iframeRef.current.contentDocument) {
            iframeRef.current.style.height = "0px";
            iframeRef.current.style.height =
              iframeRef.current.contentDocument.body.scrollHeight + "px";
          }
        };

        // Observe content changes
        const observer = new MutationObserver(resizeIframe);
        if (iframeDoc.body) {
          observer.observe(iframeDoc.body, {
            childList: true,
            subtree: true,
            attributes: true,
          });
        }

        iframeRef.current.onload = resizeIframe;
        resizeIframe(); // Initial resize
        setIsLoading(false);

        return () => observer.disconnect();
      }
    }
  }, [emailComponent]);

  return (
    <div className="py-10">
      <div className="container mx-auto">
        {isLoading && <p>Loading preview...</p>}
        <iframe
          ref={iframeRef}
          className="w-full border-none"
          title="Email Preview"
          scrolling="no"
        />
      </div>
    </div>
  );
};

export default PreviewEmail;
