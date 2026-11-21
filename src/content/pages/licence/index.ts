import { allLicencePages } from 'contentlayer/generated';
import { createPageLoader } from '../page-loader';

export const licence = createPageLoader(allLicencePages);
