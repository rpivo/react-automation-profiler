import { Box } from '@mui/material';

export default function ExampleWidget({ children }) {
  return (
    <Box
      component="div"
      sx={{
        display: 'block',
        marginTop: '3rem',
        marginBottom: '3rem',
        textAlign: 'center',
      }}
    >
      {children}
    </Box>
  );
}
