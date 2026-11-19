import { createFileRoute } from '@tanstack/react-router';
import { PublicShopPage } from './shop';

export const Route = createFileRoute('/')({
  component: PublicShopPage,
});
