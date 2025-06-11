
import { ReactNode } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';

interface ResponsiveTableProps {
  headers: string[];
  children: ReactNode;
}

export const ResponsiveTable = ({ headers, children }: ResponsiveTableProps) => {
  return (
    <div className="w-full overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block w-full overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              {headers.map((header, index) => (
                <TableHead key={index} className="text-xs sm:text-sm font-medium whitespace-nowrap">
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {children}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3 w-full">
        {children}
      </div>
    </div>
  );
};

interface ResponsiveTableRowProps {
  children: ReactNode;
  mobileContent?: ReactNode;
}

export const ResponsiveTableRow = ({ children, mobileContent }: ResponsiveTableRowProps) => {
  return (
    <>
      {/* Desktop Row */}
      <TableRow className="hidden md:table-row">
        {children}
      </TableRow>

      {/* Mobile Card */}
      {mobileContent && (
        <Card className="md:hidden w-full">
          <CardContent className="p-3 sm:p-4">
            {mobileContent}
          </CardContent>
        </Card>
      )}
    </>
  );
};
