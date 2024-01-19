import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import FacebookIcon from "@mui/icons-material/Facebook";
import GitHubIcon from '@mui/icons-material/GitHub';
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import YouTubeIcon from "@mui/icons-material/YouTube";

export default function BankFooter() {
    return (
        <Box
            component="footer"
            sx={{
                py: 3,
                px: 2,
                mt: 'auto',
                width: '100%',
                backgroundColor: (theme) =>
                    theme.palette.mode === 'light'
                        ? theme.palette.grey[200]
                        : theme.palette.grey[800],
            }}
        >
            <Grid container justifyContent="space-evenly" alignItems="top">
                <CustomerSupportGridColumn/>
                <HelpfulLinksGridColumn/>
                <SocialsGridColumn/>
            </Grid>

            <Divider style={{margin: 20}}/>
            <ProjectSubFooter/>
        </Box>
    );
}

function CustomerSupportGridColumn() {
    const header = 'Customer Support';
    const rows = [
        'Hotline: 1234 111 1111',
        'Enquiry / Feedback: assist@bank.com',
        'Address: 1 MUI Tower, #23-04, Singapore 567890'
    ];
    return (
        <Grid item xs={7} sm={2}>
            <GridColumn header={header} rows={rows}/>
        </Grid>
    );
}

function HelpfulLinksGridColumn() {
    const header = 'Useful Links';
    const rows = [
        'About Us',
        'Investor Relations',
        'Careers',
        'Research',
    ];
    return (
        <Grid item xs={4} sm={2}>
            <GridColumn header={header} rows={rows}/>
        </Grid>
    );
}

function GridColumn({header, rows}) {
    return (
        <Stack spacing={1}>
            <Grid item key={"footer-column-header".concat("-", header.split(" ").join("-"))}>
                <Typography variant="body1">{header}</Typography>
            </Grid>
            {rows.map((val) => (
                <Grid item key={"footer-column-item".concat("-", val.split(" ").join("-"))}>
                    <Typography variant="body2">{val}</Typography>
                </Grid>
            ))}
        </Stack>
    );
}

function SocialsGridColumn() {
    return (
        <Grid item xs={1} sm={1}>
            <Stack spacing={1}>
                <FacebookIcon/>
                <InstagramIcon/>
                <LinkedInIcon/>
                <YouTubeIcon/>
            </Stack>
        </Grid>
    );
}

function ProjectSubFooter() {
    return (
        <Typography variant="body2" color="text.secondary" align="center">
            {'© Copyright '}
            {new Date().getFullYear()}{' - '}
            <Link color="inherit" href="https://github.com/udemy-go-1/banking">
                View Github Project <GitHubIcon fontSize="inherit"/>
            </Link>
            <br/>
            Please note that this is not a real banking site.
        </Typography>
    );
}
