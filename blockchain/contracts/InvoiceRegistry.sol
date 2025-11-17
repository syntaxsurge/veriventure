// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title InvoiceRegistry - On-chain invoice management for entrepreneurs
/// @notice Creates and tracks invoices with native (DEV) or ERC20 payments
/// @dev Supports DKG UAL references for verifiable invoice proofs
contract InvoiceRegistry is Ownable, ReentrancyGuard {
    enum CurrencyType {
        NATIVE,
        ERC20
    }
    enum Status {
        Pending,
        Paid,
        Cancelled,
        Overdue
    }

    struct Invoice {
        uint256 id;
        address issuer;
        address payer;
        CurrencyType currencyType;
        address token; // ERC20 token address (address(0) for native)
        uint256 amount; // in wei or token units
        uint256 dueAt; // unix timestamp
        Status status;
        string memo;
        string dkgUAL; // optional DKG proof reference
        uint256 createdAt;
        uint256 paidAt;
    }

    uint256 private _nextInvoiceId = 1;
    mapping(uint256 => Invoice) private _invoices;
    mapping(address => uint256[]) private _issuerInvoices;
    mapping(address => uint256[]) private _payerInvoices;

    event InvoiceCreated(
        uint256 indexed id,
        address indexed issuer,
        address indexed payer,
        CurrencyType currencyType,
        address token,
        uint256 amount,
        uint256 dueAt,
        string memo,
        string dkgUAL
    );

    event InvoicePaid(
        uint256 indexed id,
        address indexed payer,
        address indexed issuer,
        uint256 amount,
        uint256 paidAt
    );

    event InvoiceCancelled(uint256 indexed id, address indexed issuer);

    event InvoiceMarkedOverdue(uint256 indexed id);

    modifier onlyIssuer(uint256 id) {
        require(_invoices[id].issuer == msg.sender, "InvoiceRegistry: not issuer");
        _;
    }

    modifier validInvoice(uint256 id) {
        require(id > 0 && id < _nextInvoiceId, "InvoiceRegistry: invalid invoice ID");
        _;
    }

    constructor(address initialOwner) Ownable(initialOwner) {}

    /// @notice Create a native currency invoice (DEV on Moonbase Alpha)
    /// @param payer The address that should pay this invoice (address(0) means open to anyone)
    /// @param amountWei Amount in wei
    /// @param dueAt Unix timestamp for due date
    /// @param memo Human-readable description
    /// @param dkgUAL Optional DKG UAL proof reference
    /// @return id The newly created invoice ID
    function createInvoiceNative(
        address payer,
        uint256 amountWei,
        uint256 dueAt,
        string calldata memo,
        string calldata dkgUAL
    ) external returns (uint256 id) {
        require(amountWei > 0, "InvoiceRegistry: amount must be > 0");
        require(dueAt > block.timestamp, "InvoiceRegistry: due date must be future");

        id = _nextInvoiceId++;

        Invoice storage inv = _invoices[id];
        inv.id = id;
        inv.issuer = msg.sender;
        inv.payer = payer;
        inv.currencyType = CurrencyType.NATIVE;
        inv.token = address(0);
        inv.amount = amountWei;
        inv.dueAt = dueAt;
        inv.status = Status.Pending;
        inv.memo = memo;
        inv.dkgUAL = dkgUAL;
        inv.createdAt = block.timestamp;
        inv.paidAt = 0;

        _issuerInvoices[msg.sender].push(id);
        if (payer != address(0)) {
            _payerInvoices[payer].push(id);
        }

        emit InvoiceCreated(
            id,
            msg.sender,
            payer,
            CurrencyType.NATIVE,
            address(0),
            amountWei,
            dueAt,
            memo,
            dkgUAL
        );
    }

    /// @notice Create an ERC20 token invoice
    /// @param payer The address that should pay this invoice (address(0) means open to anyone)
    /// @param token The ERC20 token contract address
    /// @param amount Amount in token units
    /// @param dueAt Unix timestamp for due date
    /// @param memo Human-readable description
    /// @param dkgUAL Optional DKG UAL proof reference
    /// @return id The newly created invoice ID
    function createInvoiceERC20(
        address payer,
        address token,
        uint256 amount,
        uint256 dueAt,
        string calldata memo,
        string calldata dkgUAL
    ) external returns (uint256 id) {
        require(token != address(0), "InvoiceRegistry: invalid token");
        require(amount > 0, "InvoiceRegistry: amount must be > 0");
        require(dueAt > block.timestamp, "InvoiceRegistry: due date must be future");

        id = _nextInvoiceId++;

        Invoice storage inv = _invoices[id];
        inv.id = id;
        inv.issuer = msg.sender;
        inv.payer = payer;
        inv.currencyType = CurrencyType.ERC20;
        inv.token = token;
        inv.amount = amount;
        inv.dueAt = dueAt;
        inv.status = Status.Pending;
        inv.memo = memo;
        inv.dkgUAL = dkgUAL;
        inv.createdAt = block.timestamp;
        inv.paidAt = 0;

        _issuerInvoices[msg.sender].push(id);
        if (payer != address(0)) {
            _payerInvoices[payer].push(id);
        }

        emit InvoiceCreated(
            id,
            msg.sender,
            payer,
            CurrencyType.ERC20,
            token,
            amount,
            dueAt,
            memo,
            dkgUAL
        );
    }

    /// @notice Pay a native currency invoice
    /// @param id The invoice ID to pay
    function payNative(uint256 id) external payable nonReentrant validInvoice(id) {
        Invoice storage inv = _invoices[id];
        require(inv.status == Status.Pending, "InvoiceRegistry: not pending");
        require(inv.currencyType == CurrencyType.NATIVE, "InvoiceRegistry: not native invoice");
        require(msg.value == inv.amount, "InvoiceRegistry: incorrect amount");

        inv.status = Status.Paid;
        inv.paidAt = block.timestamp;

        (bool success, ) = inv.issuer.call{value: msg.value}("");
        require(success, "InvoiceRegistry: transfer failed");

        emit InvoicePaid(id, msg.sender, inv.issuer, inv.amount, block.timestamp);
    }

    /// @notice Pay an ERC20 invoice (requires prior approval)
    /// @param id The invoice ID to pay
    function payERC20(uint256 id) external nonReentrant validInvoice(id) {
        Invoice storage inv = _invoices[id];
        require(inv.status == Status.Pending, "InvoiceRegistry: not pending");
        require(inv.currencyType == CurrencyType.ERC20, "InvoiceRegistry: not ERC20 invoice");

        inv.status = Status.Paid;
        inv.paidAt = block.timestamp;

        // Transfer tokens from payer to issuer
        IERC20 tokenContract = IERC20(inv.token);
        require(
            tokenContract.transferFrom(msg.sender, inv.issuer, inv.amount),
            "InvoiceRegistry: transfer failed"
        );

        emit InvoicePaid(id, msg.sender, inv.issuer, inv.amount, block.timestamp);
    }

    /// @notice Cancel a pending invoice (issuer only)
    /// @param id The invoice ID to cancel
    function cancel(uint256 id) external validInvoice(id) onlyIssuer(id) {
        Invoice storage inv = _invoices[id];
        require(inv.status == Status.Pending, "InvoiceRegistry: cannot cancel");

        inv.status = Status.Cancelled;

        emit InvoiceCancelled(id, msg.sender);
    }

    /// @notice Mark an invoice as overdue (anyone can call for expired invoices)
    /// @param id The invoice ID to mark overdue
    function markOverdue(uint256 id) external validInvoice(id) {
        Invoice storage inv = _invoices[id];
        require(inv.status == Status.Pending, "InvoiceRegistry: not pending");
        require(block.timestamp > inv.dueAt, "InvoiceRegistry: not yet overdue");

        inv.status = Status.Overdue;

        emit InvoiceMarkedOverdue(id);
    }

    /// @notice Get invoice details
    /// @param id The invoice ID
    /// @return The complete invoice struct
    function getInvoice(uint256 id) external view validInvoice(id) returns (Invoice memory) {
        return _invoices[id];
    }

    /// @notice Get all invoices issued by an address
    /// @param issuer The issuer address
    /// @return Array of invoice IDs
    function getIssuerInvoices(address issuer) external view returns (uint256[] memory) {
        return _issuerInvoices[issuer];
    }

    /// @notice Get all invoices for a payer address
    /// @param payer The payer address
    /// @return Array of invoice IDs
    function getPayerInvoices(address payer) external view returns (uint256[] memory) {
        return _payerInvoices[payer];
    }

    /// @notice Get total number of invoices created
    /// @return The next invoice ID (total count)
    function getTotalInvoices() external view returns (uint256) {
        return _nextInvoiceId - 1;
    }
}

/// @notice Minimal ERC20 interface for token transfers
interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
}
