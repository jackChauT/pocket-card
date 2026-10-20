import { notFound } from 'next/navigation';

// Unknown URLs inside /en or /zh-hk render the (site) not-found page with header and footer.
export default function CatchAll() {
  notFound();
}
