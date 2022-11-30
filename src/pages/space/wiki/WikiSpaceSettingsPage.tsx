import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { useNavigate, useParams } from 'react-router';
import WikiSpacePermissionSettings from './WikiSpacePermissionSettings';
import { Stack } from '@mui/material';

const tabs = [
  {
    label: "Permissions",
    path: "permissions",
    component: <WikiSpacePermissionSettings />
  },
]

interface TabPanelProps {
  children?: React.ReactNode;
  tabPath: string;
  value: string;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, tabPath, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== tabPath}
      id={`settings-panel-${tabPath}`}
      aria-labelledby={`settings-tab-${tabPath}`}
      {...other}
    >
      {value === tabPath && (
        // <Box sx={{ p: 3 }}>
          children
        // </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    'aria-controls': `settings-panel-${index}`,
    id: `settings-tab-${index}`,
  };
}

export default function WikiSpaceSettingsPage() {
  const navigate = useNavigate();
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    navigate(newValue);
  };

  const params = useParams();

  console.log('switching to', params)

  return (
    <Stack>
      {/* <Box sx={{ borderBottom: 1, borderColor: 'divider' }}> */}
        <Tabs onChange={handleChange} aria-label="basic tabs example" value={params['*']!}>
          {tabs.map(({ label, path }, key) => <Tab key={key} value={path} label={label!} {...a11yProps(key)} />)}
        </Tabs>
      {/* </Box> */}
      {tabs.map(({ label, path, component }, key) => <TabPanel value={params['*']!} tabPath={path!} key={key}>{component}</TabPanel>)}
    </Stack>
  );
}
