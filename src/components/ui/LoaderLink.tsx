'use client';

import React from 'react';
import Link, { LinkProps } from 'next/link';
import { useLoader } from '@/components/providers/LoaderProvider';

type LoaderLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & LinkProps;

export default function LoaderLink({ children, onClick, target, href, ...props }: LoaderLinkProps) {
  const { showLoader } = useLoader();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    if (onClick) onClick(e);
    
    // Check if the link shouldn't trigger navigation locally
    if (
      target === '_blank' || 
      e.ctrlKey || 
      e.metaKey || 
      e.shiftKey || 
      e.altKey || 
      e.defaultPrevented
    ) {
      return;
    }
    
    const hrefStr = href?.toString() || '';
    
    // Don't show loader for external or non-route links
    if (
      hrefStr.startsWith('http') || 
      hrefStr.startsWith('tel:') || 
      hrefStr.startsWith('mailto:') || 
      hrefStr.startsWith('#')
    ) {
      return;
    }

    // Otherwise, it's a valid local navigation! Show the loader.
    showLoader();
  };

  return (
    <Link href={href} target={target} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}
