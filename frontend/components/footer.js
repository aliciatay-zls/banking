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
            <Grid container>
                <Grid item xs={10}>
                    <Grid container spacing={1}>
                        <Grid item xs={6}>
                            <Typography variant="body1">
                                Customer Support
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="body1">
                                Useful Links
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="body2">
                                Hotline: 1234 111 1111
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="body2">
                                About Us
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="body2">
                                Enquiry/Feedback: assist@bank.com
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="body2">
                                Investor Relations
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="body2">
                                Address: 1 MUI Tower, #23-04, Singapore 567890
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="body2">
                                Careers
                            </Typography>
                        </Grid>
                        <Grid item xs={6} />
                        <Grid item xs={6}>
                            <Typography variant="body2">
                                Research
                            </Typography>
                        </Grid>
                    </Grid>
                </Grid>

                <Grid item xs={2}>
                    <Stack spacing={1}>
                        <FacebookIcon/>
                        <InstagramIcon/>
                        <LinkedInIcon/>
                        <YouTubeIcon/>
                    </Stack>
                </Grid>
            </Grid>

            <Divider style={{margin: 20}}/>
            <ProjectSubFooter/>
        </Box>
    );
}

function ProjectSubFooter() {
    return (
        <Typography variant="body2" color="text.secondary" align="center">
            <div>
                {'© Copyright '}
                {new Date().getFullYear()}{' - '}
                <Link color="inherit" href="https://github.com/udemy-go-1/banking">
                    View Github Project <GitHubIcon fontSize="inherit"/>
                </Link>
            </div>
            <div>
                Please note that this is not a real banking site.
            </div>
        </Typography>
    );
}
