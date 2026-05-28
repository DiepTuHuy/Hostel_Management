import fs from 'fs';
import path from 'path';

const files = [
  'src/components/common/Button.jsx',
  'src/components/common/Table.jsx',
  'src/controllers/useAuth.jsx',
  'src/layouts/AdminLayout.jsx',
  'src/layouts/ManagerLayout.jsx',
  'src/layouts/TenantLayout.jsx',
  'src/views/admin/DashboardPage.jsx',
  'src/views/admin/DebtsPage.jsx',
  'src/views/admin/ReportsPage.jsx',
  'src/views/auth/LoginPage.jsx',
  'src/views/manager/ContractsPage.jsx',
  'src/views/manager/DashboardPage.jsx',
  'src/views/manager/MetersPage.jsx',
  'src/views/visitor/RoomDetailPage.jsx'
];

for (const file of files) {
  const fullPath = path.join('src', file.replace('src/', ''));
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');

    // 1. Remove JSX comments: {/* comment */}
    content = content.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');

    // 2. Remove multi-line jsdoc/comments: /* comment */ or /** comment */
    content = content.replace(/\/\*\*?[\s\S]*?\*\//g, '');

    // 3. Remove single-line comments: // comment (but NOT in http:// or https://)
    content = content.replace(/(?<!:)\/\/.*$/gm, '');

    // 4. Clean up any multi-newline or trailing whitespace introduced by comment deletion
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

    fs.writeFileSync(fullPath, content, 'utf8');
    console.log('Stripped comments from:', fullPath);
  }
}
