
import React from 'react';
import { Product } from '../../types';

interface SEOHelperProps {
  title: string;
  description: string;
  product?: Product;
  type?: 'website' | 'product';
}

const SEOHelper: React.FC<SEOHelperProps> = ({ title, description, product, type = 'website' }) => {
  React.useEffect(() => {
    document.title = `${title} | Vaibava Lakshmi`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', description);
  }, [title, description]);

  let schema = null;

  if (type === 'product' && product) {
    schema = {
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
        "url": window.location.href,
        "priceCurrency": "INR",
        "price": product.variants[0].prices[0].amount / 100,
        "availability": product.variants[0].inventory_quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        "itemCondition": "https://schema.org/NewCondition"
      }
    };
  }

  return (
    <>
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </>
  );
};

export default SEOHelper;
