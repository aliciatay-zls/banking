import Link from "next/link";
import { Fragment, useState } from "react";
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AddCardIcon from '@mui/icons-material/AddCard';
import CircleIcon from '@mui/icons-material/Circle';

import DefaultLayout from "../../components/defaultLayout";
import serverSideProps from "../../src/serverSideProps";

export async function getServerSideProps(context) {
    return await serverSideProps(context);
}

export default function CustomersPage(props) {
    return (
        <DefaultLayout
            clientInfo={props.clientInfo}
            tabTitle={"Home"}
            headerTitle={"All Customers"}
        >
            <TableContainer component={Paper}>
                <Table aria-label="all customers table">
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>DOB</TableCell>
                            <TableCell>City</TableCell>
                            <TableCell>Zip Code</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {props.responseData.map((cus) => (
                            <Row key={cus["customer_id"].toString()} cus={cus}/>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </DefaultLayout>
    );
}

function Row({cus}) {
    const customerId = cus["customer_id"].toString();
    const customerName = cus["full_name"];
    const customerDOB = cus["date_of_birth"];
    const customerCity = cus["city"];
    const customerZip = cus["zipcode"];
    const customerStatus = cus["status"];

    return (
        <Fragment>
            <TableRow>
                <TableCell>{customerId}</TableCell>
                <TableCell>
                    <span>
                        <Link href={`/customers/${customerId}`}>
                            <Tooltip title="View profile">
                                <IconButton size="small">
                                    <AccountCircleIcon/>
                                </IconButton>
                            </Tooltip>
                        </Link>
                        {customerName}
                    </span>
                </TableCell>
                <TableCell>{customerDOB}</TableCell>
                <TableCell>{customerCity}</TableCell>
                <TableCell>{customerZip}</TableCell>
                <TableCell>
                    <CircleIcon color={customerStatus === 'active' ? "success" : "error"} sx={{height: 10}}/>
                    {customerStatus}
                </TableCell>
                <TableCell align="right">
                    <span>
                        <Link href={`/customers/${customerId}/account`}>
                            <Tooltip title="Transact on behalf">
                                <IconButton size="small">
                                    <AccountBalanceIcon/>
                                </IconButton>
                            </Tooltip>
                        </Link>
                        <Link href={`/customers/${customerId}/account/new`}>
                            <Tooltip title="Create new account">
                                <IconButton size="small">
                                    <AddCardIcon/>
                                </IconButton>
                            </Tooltip>
                        </Link>
                    </span>
                </TableCell>
            </TableRow>
        </Fragment>
    );
}
