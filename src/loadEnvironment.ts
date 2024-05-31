import path from 'path';

import dotenv from 'dotenv';

const filePath = path.resolve(__dirname, '..', '.env.development');

dotenv.config({ path: filePath });
