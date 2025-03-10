'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Code, 
  ExternalLink, 
  Book
} from 'lucide-react';

// Dynamically import SwaggerUI component to prevent SSR issues since it's a client-side only library
const SwaggerUI = dynamic(
  () => import('swagger-ui-react'), 
  { ssr: false }
);

const ApiDocsPage = () => {
  // State to track if the component is mounted on the client
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Set client state once mounted
    setIsClient(true);
    
    // Override console.error to suppress React warnings related to deprecated lifecycle methods in Swagger UI
    const originalConsoleError = console.error;
    console.error = (...args) => {
      // Filter out specific warnings from Swagger UI that use deprecated React methods
      if (args[0] && typeof args[0] === 'string' && 
          (args[0].includes('UNSAFE_') || 
           args[0].includes('componentWillReceiveProps') ||
           args[0].includes('componentWillMount'))) {
        return;
      }
      originalConsoleError(...args);
    };

    // Restore original console.error on component unmount
    return () => {
      console.error = originalConsoleError;
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-black">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* API Documentation header section */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                TryXpert API Documentation
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Complete REST API reference for developers
              </p>
            </div>
            {/* Documentation download options */}
            <div className="flex mt-4 md:mt-0 space-x-2">
              <Button variant="outline" size="sm" onClick={() => window.open('/api-docs/swagger.yaml', '_blank')}>
                <FileText className="h-4 w-4 mr-1" />
                View YAML
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.open('/api/swagger', '_blank')}>
                <Code className="h-4 w-4 mr-1" />
                View JSON
              </Button>
            </div>
          </div>
          
          {/* API version and type badges */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center text-sm px-3 py-1 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
              <Book className="h-3.5 w-3.5 mr-1" />
              <span>Version 1.0.0</span>
            </div>
            <div className="flex items-center text-sm px-3 py-1 rounded-full bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400">
              <ExternalLink className="h-3.5 w-3.5 mr-1" />
              <span>REST API</span>
            </div>
          </div>
        </div>
        
        {/* Swagger UI container */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
          <div className="swagger-ui-container">
            {/* Only render SwaggerUI on the client side */}
            {isClient && (
              <SwaggerUI 
                url="/api/swagger"
                requestInterceptor={(req) => {
                  // Can be extended to add auth headers or other request modifications
                  return req;
                }}
                // Custom plugin to remove authorization UI elements
                plugins={[
                  (system) => ({
                    components: {
                      authorizeBtn: () => null,
                      authorizeOperationBtn: () => null
                    }
                  })
                ]}
                // Configure SwaggerUI display options
                docExpansion="list"
                supportedSubmitMethods={["get", "post", "put", "delete"]}
              />
            )}
          </div>
        </div>
      </main>
      
      <Footer />
      
      {/* Global styles to customize Swagger UI appearance and add dark mode support */}
      <style jsx global>{`
        /* Hide default Swagger UI topbar */
        .swagger-ui .topbar { 
          display: none; 
        }
        /* Style title to match site branding */
        .swagger-ui .info .title {
          color: var(--colors-blue-600);
        }
        /* Typography customizations */
        .swagger-ui .opblock-tag {
          font-size: 18px;
          margin: 10px 0 5px 0;
          font-family: var(--font-family);
        }
        /* UI element border radius adjustments */
        .swagger-ui .opblock .opblock-summary-method {
          border-radius: 4px;
        }
        .swagger-ui .btn {
          border-radius: 4px;
        }
        .swagger-ui select {
          border-radius: 4px;
        }
        .swagger-ui input[type=text] {
          border-radius: 4px;
        }
        /* Hide authorization sections */
        .swagger-ui .auth-wrapper {
          display: none;
        }
        .swagger-ui .scheme-container {
          display: none;
        }
        
        /* Dark mode styling */
        .dark .swagger-ui, 
        .dark .swagger-ui .info .title,
        .dark .swagger-ui .opblock-tag,
        .dark .swagger-ui .opblock .opblock-summary-description, 
        .dark .swagger-ui .opblock-description-wrapper p, 
        .dark .swagger-ui .responses-inner h4, 
        .dark .swagger-ui .responses-inner h5,
        .dark .swagger-ui .parameter__name,
        .dark .swagger-ui .parameter__type,
        .dark .swagger-ui table thead tr th,
        .dark .swagger-ui .response-col_status,
        .dark .swagger-ui .model-title,
        .dark .swagger-ui .model {
          color: #e4e4e7;
        }
        .dark .swagger-ui .opblock-tag,
        .dark .swagger-ui .opblock-tag small {
          color: #a1a1aa;
        }
        .dark .swagger-ui .markdown p, 
        .dark .swagger-ui .markdown pre,
        .dark .swagger-ui .renderedMarkdown p, 
        .dark .swagger-ui .renderedMarkdown pre,
        .dark .swagger-ui .parameter__in {
          color: #a1a1aa;
        }
        /* Dark mode background and border colors */
        .dark .swagger-ui section.models .model-container,
        .dark .swagger-ui section.models h4 {
          background-color: #1f2937;
          border-color: #374151;
        }
        .dark .swagger-ui .opblock-description-wrapper, 
        .dark .swagger-ui .opblock-external-docs-wrapper, 
        .dark .swagger-ui .opblock-tag,
        .dark .swagger-ui .opblock-section-header {
          background-color: #1f2937;
          border-color: #374151;
        }
        .dark .swagger-ui .opblock {
          background-color: #111827;
          border-color: #374151;
        }
        .dark .swagger-ui table tbody tr td {
          background-color: #1f2937;
          color: #e4e4e7;
          border-color: #374151;
        }
        .dark .swagger-ui .parameters-col_description {
          color: #e4e4e7;
        }
        .dark .swagger-ui input[type=text],
        .dark .swagger-ui select {
          background-color: #111827;
          color: #e4e4e7;
          border-color: #374151;
        }
        .dark .swagger-ui .tab li {
          color: #e4e4e7;
        }
        /* Fix dark mode icon colors */
        .dark .swagger-ui .expand-methods svg, 
        .dark .swagger-ui .expand-operation svg,
        .dark .swagger-ui .arrow {
          fill: #ffffff !important;
        }
        
        /* Interactive element hover states */
        .swagger-ui .opblock-tag:hover,
        .swagger-ui .opblock-tag:focus {
          background-color: rgba(0, 0, 0, 0.05);
        }
        .dark .swagger-ui .opblock-tag:hover,
        .dark .swagger-ui .opblock-tag:focus {
          background-color: rgba(255, 255, 255, 0.05);
        }
        /* Visual improvements for operation blocks */
        .swagger-ui .opblock {
          margin-bottom: 16px;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        }
        .swagger-ui table {
          margin-top: 12px;
        }
        .swagger-ui .response-col_status {
          font-weight: 600;
        }
        .swagger-ui .response-col_description__inner div.markdown {
          font-size: 14px;
        }
        /* Enhance visibility of action buttons */
        .swagger-ui .download-contents {
          background-color: #f3f4f6;
          color: #1f2937;
          border-radius: 4px;
          padding: 4px 8px;
          font-size: 12px;
          font-weight: 500;
        }
        .dark .swagger-ui .download-contents {
          background-color: #374151;
          color: #e4e4e7;
        }
        .swagger-ui .try-out__btn {
          background-color: #f3f4f6 !important;
          color: #1f2937 !important;
          border-color: #d1d5db !important;
        }
        .dark .swagger-ui .try-out__btn {
          background-color: #374151 !important;
          color: #e4e4e7 !important;
          border-color: #4b5563 !important;
        }
      `}</style>
    </div>
  );
};

export default ApiDocsPage;