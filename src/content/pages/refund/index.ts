import { allRefundPages } from 'contentlayer/generated';
import { createPageLoader } from '../page-loader';

export const refund = createPageLoader(allRefundPages);
