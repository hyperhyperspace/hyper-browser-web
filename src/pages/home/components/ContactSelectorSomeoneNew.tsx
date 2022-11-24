import * as React from 'react';
import { styled } from '@mui/material/styles';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion';
import MuiAccordionSummary, {
  AccordionSummaryProps,
} from '@mui/material/AccordionSummary';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import LookupThreeWordCode from './LookupThreeWordCode';
import { Identity, Resources } from '@hyper-hyper-space/core';
import ImportExportedProfile from './ImportExportedProfile';
import { Button } from '@mui/material';
import { Stack } from '@mui/system';

const Accordion = styled((props: AccordionProps) => (
  <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  '&:not(:last-child)': {
    borderBottom: 0,
  },
  '&:before': {
    display: 'none',
  },
}));

const AccordionSummary = styled((props: AccordionSummaryProps) => (
  <MuiAccordionSummary
    expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: '0.9rem' }} />}
    {...props}
  />
))(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, .05)'
      : 'rgba(0, 0, 0, .03)',
  flexDirection: 'row-reverse',
  '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
    transform: 'rotate(90deg)',
  },
  '& .MuiAccordionSummary-content': {
    marginLeft: theme.spacing(1),
  },
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: '1px solid rgba(0, 0, 0, .125)',
}));

export default function ContactSelectorSomeoneNew(props: {resourcesForDiscovery: Resources, handleSelect: Function}) {
  const {resourcesForDiscovery} = props;
  const [expanded, setExpanded] = React.useState<string | false>('panel1');

  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, newExpanded: boolean) => {
      setExpanded(newExpanded ? panel : false);
    };

    const renderIdentity = (id?: Identity) => (
        <Stack direction="row" spacing={2}>
            {/* <Button variant="outlined" size="small" onClick={() => { navigate('../view-profile/' + encodeURIComponent(id!.getLastHash() as Hash)); }}>Open</Button> */}
            <Button variant="contained" size="small" onClick={() => { props.handleSelect(id!) }}>Add</Button>
        </Stack>
    )

  return (
    <div>
      <Accordion expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
        <AccordionSummary aria-controls="panel1d-content" id="panel1d-header">
          <Typography>Using a 3-word code</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <LookupThreeWordCode resourcesForDiscovery={resourcesForDiscovery} renderIdentity={renderIdentity}/>
        </AccordionDetails>
      </Accordion>
      <Accordion expanded={expanded === 'panel2'} onChange={handleChange('panel2')}>
        <AccordionSummary aria-controls="panel2d-content" id="panel2d-header">
          <Typography>Using an exported profile</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <ImportExportedProfile renderIdentity={renderIdentity}/>
        </AccordionDetails>
      </Accordion>
    </div>
  );
}