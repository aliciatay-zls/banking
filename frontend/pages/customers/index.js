import Link from "next/link";
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AddCardIcon from '@mui/icons-material/AddCard';
import CircleIcon from '@mui/icons-material/Circle';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import { DataGrid } from '@mui/x-data-grid';

import DefaultLayout from "../../components/DefaultLayout";
import { getReadableDate } from "../../src/formatUtils";
import serverSideProps from "../../src/serverSideProps";

export async function getServerSideProps(context) {
    const finalProps = await serverSideProps(context);
    if (!finalProps.props) {
        return finalProps;
    }

    const customerRows = [];
    finalProps.props.responseData.map((cus) => {
        customerRows.push({
            id: cus["customer_id"].toString(),
            fullName: cus["full_name"],
            dob: cus["date_of_birth"],
            email: cus["email"],
            country: cus["country"],
            zipcode: cus["zipcode"],
            status: cus["status"],
        })
    });

    return {
        props: {
            homepage: finalProps.props.homepage,
            authServerAddress: finalProps.props.authServerAddress,
            customerRows: customerRows,
        }
    };
}

const columns = [
    {
        field: 'id',
        headerName: 'ID',
        flex: 0.1,
        minWidth: 60,
        editable: false,
    },
    {
        field: 'fullName',
        headerName: 'Full Name',
        flex: 1.1,
        minWidth: 150,
        editable: false,
        renderCell: (params) =>
            <span>
                <Link href={`/customers/${params.row.id}/profile`}>
                    <Tooltip title="View profile">
                        <IconButton size="small" touchRippleRef={null}>
                            <AccountCircleIcon/>
                        </IconButton>
                    </Tooltip>
                </Link>
                {params.value}
            </span>
        ,
    },
    {
        field: 'dob',
        headerName: 'DOB',
        flex: 0.8,
        minWidth: 150,
        editable: false,
        type: 'date',
        valueGetter: ({value}) => value && new Date(value),
        renderCell: ({value}) => value && getReadableDate(value),
    },
    {
        field: 'email',
        headerName: 'Email',
        flex: 1.1,
        minWidth: 150,
        editable: false,
    },
    {
        field: 'country',
        headerName: 'Country',
        flex: 1,
        minWidth: 150,
        editable: false,
    },
    {
        field: 'zipcode',
        headerName: 'Zip',
        flex: 0.5,
        minWidth: 80,
        editable: false,
    },
    {
        field: 'status',
        headerName: 'Status',
        flex: 0.1,
        minWidth: 90,
        editable: false,
        renderCell: ({value}) =>
            <span>
                <CircleIcon className="icon--inline" color={value === 'active' ? "success" : "error"}/>
                {value}
            </span>
        ,
    },
    {
        field: 'actions',
        headerName: 'Actions',
        flex: 0.3,
        minWidth: 110,
        type: 'actions',
        renderCell: ({row}) => [
            <span key="customers-table-transact-button">
                <Link href={`/customers/${row.id}`}>
                    <Tooltip title="Transact on behalf">
                        <IconButton size="small" touchRippleRef={null}>
                            <CurrencyExchangeIcon />
                        </IconButton>
                    </Tooltip>
                </Link>
            </span>,
            <span key="customers-table-new-account-button">
                <Link href={`/customers/${row.id}/account/new`}>
                    <Tooltip title="Create new account">
                        <IconButton size="small" touchRippleRef={null}>
                            <AddCardIcon/>
                        </IconButton>
                    </Tooltip>
                </Link>
            </span>,
        ],
    },
];

export default function CustomersPage(props) {
    return (
        <DefaultLayout
            isLoading={false}
            homepage={props.homepage}
            isPossibleTOB={false}
            authServerAddress={props.authServerAddress}
            tabTitle={"Home"}
            headerTitle={"Customers"}
        >
            <Box className="grid">
                <DataGrid
                    rows={props.customerRows}
                    columns={columns}
                    initialState={{
                        pagination: {
                            paginationModel: {
                                pageSize: 5,
                            },
                        },
                    }}
                    pageSizeOptions={[5]}
                    disableRowSelectionOnClick
                />
            </Box>
        </DefaultLayout>
    );
}
