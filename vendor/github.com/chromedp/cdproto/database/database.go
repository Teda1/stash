// Package database provides the Chrome DevTools Protocol
// commands, types, and events for the Database domain.
//
// Generated by the cdproto-gen command.
package database

// Code generated by cdproto-gen. DO NOT EDIT.

import (
	"context"

	"github.com/chromedp/cdproto/cdp"
	"github.com/mailru/easyjson"
)

// DisableParams disables database tracking, prevents database events from
// being sent to the client.
type DisableParams struct{}

// Disable disables database tracking, prevents database events from being
// sent to the client.
//
// See: https://chromedevtools.github.io/devtools-protocol/tot/Database#method-disable
func Disable() *DisableParams {
	return &DisableParams{}
}

// Do executes Database.disable against the provided context.
func (p *DisableParams) Do(ctx context.Context) (err error) {
	return cdp.Execute(ctx, CommandDisable, nil, nil)
}

// EnableParams enables database tracking, database events will now be
// delivered to the client.
type EnableParams struct{}

// Enable enables database tracking, database events will now be delivered to
// the client.
//
// See: https://chromedevtools.github.io/devtools-protocol/tot/Database#method-enable
func Enable() *EnableParams {
	return &EnableParams{}
}

// Do executes Database.enable against the provided context.
func (p *EnableParams) Do(ctx context.Context) (err error) {
	return cdp.Execute(ctx, CommandEnable, nil, nil)
}

// ExecuteSQLParams [no description].
type ExecuteSQLParams struct {
	DatabaseID ID     `json:"databaseId"`
	Query      string `json:"query"`
}

// ExecuteSQL [no description].
//
// See: https://chromedevtools.github.io/devtools-protocol/tot/Database#method-executeSQL
//
// parameters:
//
//	databaseID
//	query
func ExecuteSQL(databaseID ID, query string) *ExecuteSQLParams {
	return &ExecuteSQLParams{
		DatabaseID: databaseID,
		Query:      query,
	}
}

// ExecuteSQLReturns return values.
type ExecuteSQLReturns struct {
	ColumnNames []string              `json:"columnNames,omitempty"`
	Values      []easyjson.RawMessage `json:"values,omitempty"`
	SQLError    *Error                `json:"sqlError,omitempty"`
}

// Do executes Database.executeSQL against the provided context.
//
// returns:
//
//	columnNames
//	values
//	sqlError
func (p *ExecuteSQLParams) Do(ctx context.Context) (columnNames []string, values []easyjson.RawMessage, sqlError *Error, err error) {
	// execute
	var res ExecuteSQLReturns
	err = cdp.Execute(ctx, CommandExecuteSQL, p, &res)
	if err != nil {
		return nil, nil, nil, err
	}

	return res.ColumnNames, res.Values, res.SQLError, nil
}

// GetDatabaseTableNamesParams [no description].
type GetDatabaseTableNamesParams struct {
	DatabaseID ID `json:"databaseId"`
}

// GetDatabaseTableNames [no description].
//
// See: https://chromedevtools.github.io/devtools-protocol/tot/Database#method-getDatabaseTableNames
//
// parameters:
//
//	databaseID
func GetDatabaseTableNames(databaseID ID) *GetDatabaseTableNamesParams {
	return &GetDatabaseTableNamesParams{
		DatabaseID: databaseID,
	}
}

// GetDatabaseTableNamesReturns return values.
type GetDatabaseTableNamesReturns struct {
	TableNames []string `json:"tableNames,omitempty"`
}

// Do executes Database.getDatabaseTableNames against the provided context.
//
// returns:
//
//	tableNames
func (p *GetDatabaseTableNamesParams) Do(ctx context.Context) (tableNames []string, err error) {
	// execute
	var res GetDatabaseTableNamesReturns
	err = cdp.Execute(ctx, CommandGetDatabaseTableNames, p, &res)
	if err != nil {
		return nil, err
	}

	return res.TableNames, nil
}

// Command names.
const (
	CommandDisable               = "Database.disable"
	CommandEnable                = "Database.enable"
	CommandExecuteSQL            = "Database.executeSQL"
	CommandGetDatabaseTableNames = "Database.getDatabaseTableNames"
)
