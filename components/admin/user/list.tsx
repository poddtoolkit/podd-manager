import Spinner from "components/widgets/spinner";
import Table from "components/widgets/table";
import { Observer } from "mobx-react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import Filter from "./filter";
import { AdminUserListViewModel } from "./listViewModel";
import ErrorDisplay from "components/widgets/errorDisplay";
import Link from "next/link";
import { AddButton } from "components/widgets/forms";
import useServices from "lib/services/provider";
import {
  NumberParam,
  StringParam,
  useSearchParams,
} from "lib/hooks/searchParam";
import Paginate from "components/widgets/table/paginate";
import ConfirmDialog from "components/widgets/dialogs/confirmDialog";
import { User } from "lib/services/user";

const UserList = () => {
  const router = useRouter();
  const { userService } = useServices();
  const [searchValue, onSearchChange] = useSearchParams({
    q: StringParam,
    limit: NumberParam,
    offset: NumberParam,
  });

  const [viewModel] = useState<AdminUserListViewModel>(() =>
    new AdminUserListViewModel(
      userService,
      searchValue.q as string,
      searchValue.offset as number
    ).registerDialog("confirmDelete")
  );

  useEffect(() => {
    viewModel.setSearchValue(
      searchValue.q as string,
      searchValue.offset as number
    );
  }, [searchValue, viewModel]);

  if (!viewModel) {
    return <Spinner />;
  }
  return (
    <Observer>
      {() => (
        <div>
          <div className="flex items-center flex-wrap mb-4">
            <Filter
              nameSearch={viewModel.nameSearch}
              onChange={value => onSearchChange("q", value)}
            />
            <div className="flex-grow"></div>
            <Link href={"/admin/users/create"} passHref>
              <AddButton />
            </Link>
          </div>

          <Table
            columns={[
              {
                label: "Id",
                get: record => record.id,
              },
              {
                label: "User Name",
                get: record => record.username,
              },
              {
                label: "First Name",
                get: record => record.firstName,
              },
              {
                label: "Last Name",
                get: record => record.lastName,
              },
              {
                label: "Email",
                get: record => record.email,
              },
            ]}
            data={viewModel?.data || []}
            onEdit={record => router.push(`/admin/users/${record.id}/update`)}
            onView={record => router.push(`/admin/users/${record.id}/view`)}
            onDelete={record => viewModel.dialog("confirmDelete")?.open(record)}
          />
          <ErrorDisplay message={viewModel?.errorMessage} />

          <Paginate
            offset={viewModel.offset}
            limit={viewModel.limit}
            totalCount={viewModel.totalCount}
            onChange={value => onSearchChange("offset", value)}
          />

          <ConfirmDialog
            store={viewModel.dialog("confirmDelete")}
            title="Confirm delete"
            content="Are you sure?"
            onYes={(record: User) => viewModel.delete(record.id)}
            onNo={() => viewModel.dialog("confirmDelete")?.close()}
          />
        </div>
      )}
    </Observer>
  );
};

export default UserList;
