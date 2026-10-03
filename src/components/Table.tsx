export interface TableRow {
  name: string;
  value: string;
  units?: string;
  icon?: string;
}

export default function Table({ rows }: { rows: TableRow[] }) {
  return (
    <table className="table-auto w-full body-medium">
      <tbody>
        {rows.map((row) => (
          <tr key={row.name}>
            <td className="primary-text py-2">
              <md-icon>{row.icon ?? ''}</md-icon>
            </td>
            <th className="pl-2 text-left">{row.name}</th>
            <td className="pl-2 text-right">
              <span>{row.value.toString()}</span>
              <span className="body-small">{row.units ?? ''}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
