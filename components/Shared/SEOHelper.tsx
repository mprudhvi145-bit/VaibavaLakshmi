import React from 'react';
import { Product } from '../../types';
import { useLocation } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  path: string;
}

interface SEOHelperProps {
  title: string;
  description: string;
  product?: Product;
  type?: 'website' | 'product' | 'collection';
  breadcrumbs?: BreadcrumbItem[];
}

const SEOHelper: React.FC<SEOHelperProps> = ({ title, description, product, type = 'website', breadcrumbs }) => {
  const location = useLocation();
  
  // Construct canonical URL (handling HashRouter or BrowserRouter implicitly by using window location)
  const canonicalUrl = `${window.location.origin}${window.location.pathname}${window.location.hash}`;

  React.useEffect(() => {
    document.title = `${title} | Vaibava Lakshmi`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', description);
    
    // Update Canonical
    let linkCanonical = document.querySelector("link[rel='canonical']");
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', canonicalUrl);

  }, [title, description, canonicalUrl]);

  const schemas = [];

  // 1. Breadcrumb Schema
  if (breadcrumbs && breadcrumbs.length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbs.map((crumb, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": crumb.label,
        "item": `${window.location.origin}/#${crumb.path}` // Assuming HashRouter
      }))
    });
  }

  // 2. Product Schema
  if (type === 'product' && product) {
    schemas.push({
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": product.title,
      "image": product.thumbnail,
      "description": description,
      "brand": {
        "@type": "Brand",
        "name": "Vaibava Lakshmi"
      },
      "offers": {
        "@type": "Offer",
        "url": canonicalUrl,
        "priceCurrency": "INR",
        "price": product.variants[0].prices[0].amount / 100,
        "availability": product.variants[0].inventory_quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        "itemCondition": "https://schema.org/NewCondition"
      }
    });
  }

  return (
    <>
      {schemas.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </>
  );
};

export default SEOHelper;