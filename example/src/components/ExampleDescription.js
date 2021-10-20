import { Typography } from '@mui/material';

export default function ExampleDescription({ children }) {
  return (
    <Typography
      variant="p"
      style={{ fontFamily: 'helvetica', lineHeight: '1.5rem' }}
    >
      {children}
    </Typography>
  );
}
